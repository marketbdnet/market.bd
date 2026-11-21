package com.marketbd.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.SslErrorHandler;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class MainActivity extends AppCompatActivity {

    private static final String TARGET_URL = "https://marketbd.net/";
    private static final String APP_USER_AGENT_SUFFIX = " MarketBDAndroidApp/2.5.0";
    private static final long LOAD_WATCHDOG_TIMEOUT_MS = 15000L; // 15s max wait before showing retry UI
    private static final long RESUME_RELOAD_THRESHOLD_MS = 10 * 60 * 1000L; // 10 minutes

    private WebView webView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private FrameLayout loadingOverlay;
    private TextView loadingStatusText;
    private Button retryButton;
    private ProgressBar loadingSpinner;

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private Runnable loadWatchdogRunnable;
    private boolean pageRenderedSuccessfully = false;

    private ValueCallback<Uri[]> filePathCallback;
    private Uri cameraImageUri;
    private long pausedAtMs = 0;
    private long activeApkDownloadId = -1L;

    private final BroadcastReceiver apkDownloadReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent == null || !DownloadManager.ACTION_DOWNLOAD_COMPLETE.equals(intent.getAction())) {
                return;
            }
            long completedId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L);
            if (completedId == -1L || completedId != activeApkDownloadId) {
                return;
            }
            activeApkDownloadId = -1L;
            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (dm == null) return;

            DownloadManager.Query query = new DownloadManager.Query();
            query.setFilterById(completedId);
            try (Cursor cursor = dm.query(query)) {
                if (cursor != null && cursor.moveToFirst()) {
                    int statusIdx = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);
                    int status = statusIdx >= 0 ? cursor.getInt(statusIdx) : -1;
                    if (status == DownloadManager.STATUS_SUCCESSFUL) {
                        Uri downloadedUri = dm.getUriForDownloadedFile(completedId);
                        if (downloadedUri != null) {
                            Toast.makeText(
                                    MainActivity.this,
                                    "Download ফোল্ডারে APK সেভ হয়েছে! ইনস্টলার চালু হচ্ছে...",
                                    Toast.LENGTH_LONG
                            ).show();
                            Intent installIntent = new Intent(Intent.ACTION_VIEW);
                            installIntent.setDataAndType(downloadedUri, "application/vnd.android.package-archive");
                            installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            try {
                                startActivity(installIntent);
                            } catch (Exception ignored) {
                            }
                        }
                    } else {
                        Toast.makeText(
                                MainActivity.this,
                                "APK ডাউনলোড সম্পন্ন হয়নি। পুনরায় চেষ্টা করুন।",
                                Toast.LENGTH_LONG
                        ).show();
                    }
                }
            } catch (Exception ignored) {
            }
        }
    };

    // Modern AndroidX ActivityResultLauncher for Camera/Gallery file selection
    private final ActivityResultLauncher<Intent> fileChooserLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (filePathCallback == null) {
                    return;
                }

                Uri[] results = null;
                if (result.getResultCode() == Activity.RESULT_OK) {
                    Intent data = result.getData();
                    if (data != null) {
                        ClipData clipData = data.getClipData();
                        if (clipData != null && clipData.getItemCount() > 0) {
                            List<Uri> uriList = new ArrayList<>();
                            for (int i = 0; i < clipData.getItemCount(); i++) {
                                Uri itemUri = clipData.getItemAt(i).getUri();
                                if (itemUri != null) {
                                    uriList.add(itemUri);
                                }
                            }
                            if (!uriList.isEmpty()) {
                                results = uriList.toArray(new Uri[0]);
                            }
                        } else if (data.getData() != null) {
                            results = new Uri[]{data.getData()};
                        }
                    }

                    if (results == null && cameraImageUri != null) {
                        File cameraFile = new File(getExternalFilesDir(Environment.DIRECTORY_PICTURES), "captured_image.jpg");
                        if (cameraFile.exists() && cameraFile.length() > 0) {
                            results = new Uri[]{cameraImageUri};
                        }
                    }
                }

                filePathCallback.onReceiveValue(results);
                filePathCallback = null;
            }
    );

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Root FrameLayout holds SwipeRefreshLayout(WebView) + fast native splash/retry overlay
        FrameLayout rootContainer = new FrameLayout(this);
        rootContainer.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // 1. Setup Pull-To-Refresh Layout
        swipeRefreshLayout = new SwipeRefreshLayout(this);
        swipeRefreshLayout.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // 2. Setup High-Performance Hardware-Accelerated WebView
        webView = new WebView(this);
        webView.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        swipeRefreshLayout.addView(webView);
        rootContainer.addView(swipeRefreshLayout);

        // Build Native Splash / Loading Overlay (shown only during initial cold load)
        buildLoadingOverlay(rootContainer);
        setContentView(rootContainer);

        // Pull-to-refresh listener: force fresh revalidation only when user manually swipes down
        swipeRefreshLayout.setOnRefreshListener(() -> {
            String currentUrl = (webView != null && webView.getUrl() != null) ? webView.getUrl() : TARGET_URL;
            loadPage(currentUrl, true);
        });

        // Prevent pull-to-refresh conflict while scrolling inner page content
        webView.getViewTreeObserver().addOnScrollChangedListener(() -> {
            if (webView != null) {
                swipeRefreshLayout.setEnabled(webView.getScrollY() == 0);
            }
        });

        // 3. Configure Fast & Secure WebSettings (Allow HTTP Cache for hashed JS/CSS/Image bundles)
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setGeolocationEnabled(true);

        if (isNetworkAvailable()) {
            webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        } else {
            webSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        }

        // Security Hardening
        webSettings.setAllowFileAccess(false);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(false);
        webSettings.setAllowUniversalAccessFromFileURLs(false);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            webSettings.setSafeBrowsingEnabled(true);
        }

        // Layout & Viewport Configuration (match Desktop 1:1 scale & palette)
        webSettings.setSupportZoom(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setTextZoom(100);
        webSettings.setMediaPlaybackRequiresUserGesture(false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            webSettings.setAlgorithmicDarkeningAllowed(false);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            @SuppressWarnings("deprecation")
            int forceDarkOff = WebSettings.FORCE_DARK_OFF;
            webSettings.setForceDark(forceDarkOff);
        }

        String defaultUa = webSettings.getUserAgentString();
        webSettings.setUserAgentString(defaultUa + APP_USER_AGENT_SUFFIX);

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        // 4. Setup WebViewClient with fast error recovery and watchdog cancellation
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request != null && request.getUrl() != null) {
                    return handleUrlRouting(view, request.getUrl());
                }
                return false;
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url != null) {
                    return handleUrlRouting(view, Uri.parse(url));
                }
                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                pageRenderedSuccessfully = true;
                cancelLoadWatchdog();
                hideLoadingOverlay();
                if (swipeRefreshLayout != null && swipeRefreshLayout.isRefreshing()) {
                    swipeRefreshLayout.setRefreshing(false);
                }
                CookieManager.getInstance().flush();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request != null && request.isForMainFrame()) {
                    handleMainFrameLoadFailure();
                }
            }

            @SuppressWarnings("deprecation")
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                if (failingUrl != null && failingUrl.equals(view.getUrl())) {
                    handleMainFrameLoadFailure();
                }
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
                super.onReceivedHttpError(view, request, errorResponse);
                if (request != null && request.isForMainFrame() && errorResponse != null && errorResponse.getStatusCode() >= 500) {
                    handleMainFrameLoadFailure();
                }
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel();
                handleMainFrameLoadFailure();
            }
        });

        // 5. Setup WebChromeClient with Progress-driven splash dismissal & File Chooser
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                super.onProgressChanged(view, newProgress);
                if (newProgress >= 75) {
                    pageRenderedSuccessfully = true;
                    cancelLoadWatchdog();
                    hideLoadingOverlay();
                }
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                Intent chooserIntent = createFileChooserIntent(fileChooserParams);
                try {
                    fileChooserLauncher.launch(chooserIntent);
                    return true;
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    return false;
                }
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (origin != null && (origin.startsWith("https://marketbd.net") || origin.startsWith("http://localhost") || origin.startsWith("https://localhost"))) {
                    callback.invoke(origin, true, false);
                } else {
                    callback.invoke(origin, false, false);
                }
            }

            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                if (request != null) {
                    runOnUiThread(() -> request.grant(request.getResources()));
                }
            }
        });

        // 6. Native Android DownloadListener (saves APK directly into phone Downloads folder + triggers Install)
        webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) ->
                startApkOrFileDownload(url, userAgent, contentDisposition, mimetype)
        );

        ContextCompat.registerReceiver(
                this,
                apkDownloadReceiver,
                new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
                ContextCompat.RECEIVER_EXPORTED
        );

        // 7. Modern AndroidX Back Navigation
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });

        // 8. Request Android 13+ Notification Permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1001);
            }
        }

        // 9. Initial Page Load using standard HTTP cache (instant open on repeat launches)
        if (savedInstanceState == null) {
            loadPage(TARGET_URL, false);
        } else {
            webView.restoreState(savedInstanceState);
            hideLoadingOverlay();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    private void buildLoadingOverlay(FrameLayout parent) {
        loadingOverlay = new FrameLayout(this);
        loadingOverlay.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        loadingOverlay.setBackgroundColor(Color.WHITE);

        LinearLayout centerBox = new LinearLayout(this);
        centerBox.setOrientation(LinearLayout.VERTICAL);
        centerBox.setGravity(Gravity.CENTER);
        FrameLayout.LayoutParams boxParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.CENTER
        );
        int pad = dpToPx(24);
        centerBox.setPadding(pad, pad, pad, pad);

        ImageView splashLogo = new ImageView(this);
        splashLogo.setImageResource(R.drawable.marketbd_logo);
        splashLogo.setScaleType(ImageView.ScaleType.CENTER_CROP);
        LinearLayout.LayoutParams logoParams = new LinearLayout.LayoutParams(
                dpToPx(92), dpToPx(92)
        );
        logoParams.bottomMargin = dpToPx(14);
        splashLogo.setLayoutParams(logoParams);

        TextView brandTitle = new TextView(this);
        brandTitle.setText("MarketBD.Net");
        brandTitle.setTextColor(Color.parseColor("#B91C1C"));
        brandTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 24);
        brandTitle.setTypeface(null, Typeface.BOLD);
        brandTitle.setGravity(Gravity.CENTER);

        loadingSpinner = new ProgressBar(this);
        LinearLayout.LayoutParams spinnerParams = new LinearLayout.LayoutParams(
                dpToPx(36), dpToPx(36)
        );
        spinnerParams.topMargin = dpToPx(16);
        spinnerParams.bottomMargin = dpToPx(12);
        loadingSpinner.setLayoutParams(spinnerParams);

        loadingStatusText = new TextView(this);
        loadingStatusText.setText("অ্যাপ লোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন");
        loadingStatusText.setTextColor(Color.parseColor("#475569"));
        loadingStatusText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        loadingStatusText.setGravity(Gravity.CENTER);

        retryButton = new Button(this);
        retryButton.setText("পুনরায় চেষ্টা করুন (Retry)");
        retryButton.setVisibility(View.GONE);
        retryButton.setBackgroundColor(Color.parseColor("#DC2626"));
        retryButton.setTextColor(Color.WHITE);
        LinearLayout.LayoutParams btnParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        btnParams.topMargin = dpToPx(16);
        retryButton.setLayoutParams(btnParams);
        retryButton.setOnClickListener(v -> loadPage(TARGET_URL, true));

        centerBox.addView(splashLogo);
        centerBox.addView(brandTitle);
        centerBox.addView(loadingSpinner);
        centerBox.addView(loadingStatusText);
        centerBox.addView(retryButton);
        loadingOverlay.addView(centerBox, boxParams);
        parent.addView(loadingOverlay);
    }

    private int dpToPx(int dp) {
        return Math.round(TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                dp,
                getResources().getDisplayMetrics()
        ));
    }

    private void showLoadingState() {
        if (loadingOverlay == null) return;
        loadingOverlay.setVisibility(View.VISIBLE);
        if (loadingSpinner != null) loadingSpinner.setVisibility(View.VISIBLE);
        if (retryButton != null) retryButton.setVisibility(View.GONE);
        if (loadingStatusText != null) {
            loadingStatusText.setText("অ্যাপ লোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন");
        }
    }

    private void hideLoadingOverlay() {
        if (loadingOverlay != null && loadingOverlay.getVisibility() == View.VISIBLE) {
            loadingOverlay.setVisibility(View.GONE);
        }
    }

    private void handleMainFrameLoadFailure() {
        cancelLoadWatchdog();
        if (swipeRefreshLayout != null && swipeRefreshLayout.isRefreshing()) {
            swipeRefreshLayout.setRefreshing(false);
        }
        if (loadingOverlay != null) {
            loadingOverlay.setVisibility(View.VISIBLE);
        }
        if (loadingSpinner != null) loadingSpinner.setVisibility(View.GONE);
        if (retryButton != null) retryButton.setVisibility(View.VISIBLE);
        if (loadingStatusText != null) {
            loadingStatusText.setText(isNetworkAvailable()
                    ? "সার্ভারের সাথে সংযোগ হতে সময় লাগছে। দয়া করে Retry চাপুন।"
                    : "ইন্টারনেট সংযোগ নেই। ওয়াইফাই বা মোবাইল ডাটা চালু করে Retry চাপুন।");
        }
    }

    private void startLoadWatchdog() {
        cancelLoadWatchdog();
        loadWatchdogRunnable = () -> {
            if (!pageRenderedSuccessfully) {
                handleMainFrameLoadFailure();
            }
        };
        mainHandler.postDelayed(loadWatchdogRunnable, LOAD_WATCHDOG_TIMEOUT_MS);
    }

    private void cancelLoadWatchdog() {
        if (loadWatchdogRunnable != null) {
            mainHandler.removeCallbacks(loadWatchdogRunnable);
            loadWatchdogRunnable = null;
        }
    }

    /**
     * Checks if active internet connection is available
     */
    private boolean isNetworkAvailable() {
        try {
            ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    android.net.Network activeNetwork = cm.getActiveNetwork();
                    if (activeNetwork != null) {
                        NetworkCapabilities capabilities = cm.getNetworkCapabilities(activeNetwork);
                        return capabilities != null && (
                                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
                        );
                    }
                } else {
                    android.net.NetworkInfo activeNetworkInfo = cm.getActiveNetworkInfo();
                    return activeNetworkInfo != null && activeNetworkInfo.isConnected();
                }
            }
        } catch (Exception ignored) {
        }
        return true;
    }

    /**
     * Loads target URL efficiently. Uses WebView disk cache for fast startup;
     * forces cache revalidation only when explicitly requested (pull-to-refresh or retry).
     */
    private void loadPage(String url, boolean forceFresh) {
        if (webView == null || url == null) return;
        pageRenderedSuccessfully = false;
        if (!forceFresh || loadingOverlay.getVisibility() == View.VISIBLE) {
            showLoadingState();
        }
        startLoadWatchdog();

        if (isNetworkAvailable()) {
            webView.getSettings().setCacheMode(WebSettings.LOAD_DEFAULT);
        } else {
            webView.getSettings().setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        }

        if (forceFresh) {
            Map<String, String> extraHeaders = new HashMap<>();
            extraHeaders.put("Cache-Control", "no-cache");
            webView.loadUrl(url, extraHeaders);
        } else {
            webView.loadUrl(url);
        }
    }

    /**
     * Handles internal navigation vs external links (WhatsApp, Phone dialer, Email, External browsers)
     */
    private boolean handleUrlRouting(WebView view, Uri uri) {
        if (uri == null) return false;

        String scheme = uri.getScheme();
        String host = uri.getHost();

        if ("tel".equalsIgnoreCase(scheme) || "mailto".equalsIgnoreCase(scheme) ||
                "sms".equalsIgnoreCase(scheme) || "whatsapp".equalsIgnoreCase(scheme)) {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                startActivity(intent);
                return true;
            } catch (Exception ignored) {
                return true;
            }
        }

        if ("intent".equalsIgnoreCase(scheme)) {
            try {
                Intent intent = Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME);
                startActivity(intent);
                return true;
            } catch (Exception ignored) {
                return true;
            }
        }

        if (host != null && host.contains("vercel.app")) {
            String path = uri.getPath() != null ? uri.getPath() : "";
            String query = uri.getQuery() != null ? "?" + uri.getQuery() : "";
            loadPage("https://marketbd.net" + path + query, false);
            return true;
        }

        if (isDirectApkUri(uri)) {
            String ua = webView != null ? webView.getSettings().getUserAgentString() : null;
            startApkOrFileDownload(uri.toString(), ua, null, "application/vnd.android.package-archive");
            return true;
        }

        if (host != null && (host.equalsIgnoreCase("marketbd.net") || host.endsWith(".marketbd.net"))) {
            return false;
        }

        try {
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, uri);
            startActivity(browserIntent);
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }

    private boolean isDirectApkUri(Uri uri) {
        if (uri == null) return false;
        String urlStr = uri.toString().toLowerCase(Locale.US);
        String path = uri.getPath() != null ? uri.getPath().toLowerCase(Locale.US) : "";
        return path.endsWith(".apk")
                || path.startsWith("/api/download/apk")
                || (urlStr.contains("drive.google.com") && urlStr.contains("export=download"))
                || (urlStr.contains("dropbox.com") && urlStr.contains("dl=1"));
    }

    private void startApkOrFileDownload(String url, String userAgent, String contentDisposition, String mimetype) {
        if (url == null || url.isEmpty()) return;

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            } catch (Exception ignored) {
            }
            return;
        }

        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P &&
                ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, 1002);
            Toast.makeText(
                    this,
                    "ফাইল সেভ করতে স্টোরেজ পারমিশন দিন এবং পুনরায় ডাউনলোড চাপুন।",
                    Toast.LENGTH_LONG
            ).show();
            return;
        }

        String lowerUrl = url.toLowerCase(Locale.US);
        String lowerMime = mimetype != null ? mimetype.toLowerCase(Locale.US) : "";
        boolean isApk = lowerMime.contains("android.package-archive")
                || lowerUrl.contains(".apk")
                || lowerUrl.contains("/api/download/apk")
                || (lowerUrl.contains("drive.google.com") && lowerUrl.contains("export=download"));

        String fileName = URLUtil.guessFileName(url, contentDisposition, mimetype);
        if (isApk && (fileName == null || !fileName.toLowerCase(Locale.US).endsWith(".apk"))) {
            fileName = "MarketBD.apk";
        }

        try {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            String cookies = CookieManager.getInstance().getCookie(url);
            if (cookies != null && !cookies.isEmpty()) {
                request.addRequestHeader("Cookie", cookies);
            }
            if (userAgent != null && !userAgent.isEmpty()) {
                request.addRequestHeader("User-Agent", userAgent);
            }
            request.setTitle(fileName);
            request.setDescription(isApk
                    ? "MarketBD.Net অ্যাপ ডাউনলোড হচ্ছে (Download ফোল্ডার)..."
                    : "MarketBD.Net ফাইল ডাউনলোড হচ্ছে...");
            if (isApk) {
                request.setMimeType("application/vnd.android.package-archive");
            } else if (mimetype != null && !mimetype.isEmpty()) {
                request.setMimeType(mimetype);
            }
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);

            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (dm != null) {
                long downloadId = dm.enqueue(request);
                if (isApk) {
                    activeApkDownloadId = downloadId;
                }
                Toast.makeText(
                        this,
                        "Download ফোল্ডারে " + fileName + " সেভ হচ্ছে...",
                        Toast.LENGTH_LONG
                ).show();
                return;
            }
        } catch (Exception ignored) {
        }

        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
        } catch (Exception ignored) {
        }
    }

    /**
     * Creates an integrated Intent Chooser supporting Camera Capture + File/Gallery Pick
     */
    private Intent createFileChooserIntent(WebChromeClient.FileChooserParams fileChooserParams) {
        Intent takePictureIntent = null;

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
                File photoFile = null;
                try {
                    String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
                    String imageFileName = "JPEG_" + timeStamp + "_";
                    File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
                    photoFile = File.createTempFile(imageFileName, ".jpg", storageDir);
                } catch (IOException ignored) {
                }

                if (photoFile != null) {
                    cameraImageUri = FileProvider.getUriForFile(
                            this,
                            getApplicationContext().getPackageName() + ".fileprovider",
                            photoFile
                    );
                    takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri);
                }
            }
        }

        Intent contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
        contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);
        contentSelectionIntent.setType("image/*");

        if (fileChooserParams != null) {
            String[] acceptTypes = fileChooserParams.getAcceptTypes();
            if (acceptTypes != null && acceptTypes.length > 0 && !acceptTypes[0].isEmpty()) {
                contentSelectionIntent.putExtra(Intent.EXTRA_MIME_TYPES, acceptTypes);
            }
            if (fileChooserParams.getMode() == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE) {
                contentSelectionIntent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
            }
        }

        Intent[] intentArray;
        if (takePictureIntent != null) {
            intentArray = new Intent[]{takePictureIntent};
        } else {
            intentArray = new Intent[0];
        }

        Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
        chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
        chooserIntent.putExtra(Intent.EXTRA_TITLE, "Select Photo / Gallery / Camera");
        chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray);

        return chooserIntent;
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            if (pausedAtMs > 0 && (System.currentTimeMillis() - pausedAtMs) > RESUME_RELOAD_THRESHOLD_MS) {
                String currentUrl = webView.getUrl() != null ? webView.getUrl() : TARGET_URL;
                loadPage(currentUrl, false);
            }
            pausedAtMs = 0;
        }
    }

    @Override
    protected void onPause() {
        pausedAtMs = System.currentTimeMillis();
        if (webView != null) {
            webView.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        cancelLoadWatchdog();
        try {
            unregisterReceiver(apkDownloadReceiver);
        } catch (Exception ignored) {
        }
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
