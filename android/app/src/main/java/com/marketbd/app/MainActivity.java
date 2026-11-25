package com.marketbd.app;

import android.Manifest;
import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ValueAnimator;
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
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PathMeasure;
import android.graphics.Shader;
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
import android.view.animation.LinearInterpolator;
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
    private VideoMatchedSplashView nativeSplashView;
    private TextView loadingStatusText;
    private Button retryButton;
    private Button skipIntroButton;
    private ProgressBar loadingSpinner;

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private Runnable loadWatchdogRunnable;
    private boolean pageRenderedSuccessfully = false;
    private boolean nativeSplashCompleted = false;
    private boolean isLoadFailedState = false;

    private ValueCallback<Uri[]> filePathCallback;
    private Uri cameraImageUri;
    private long pausedAtMs = 0;
    private long activeApkDownloadId = -1L;
    private long nativeSplashStartedAtMs = 0L;

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
            nativeSplashCompleted = true;
            if (nativeSplashView != null) {
                nativeSplashView.jumpToSettled();
            }
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
        nativeSplashStartedAtMs = System.currentTimeMillis();
        nativeSplashCompleted = false;
        isLoadFailedState = false;

        loadingOverlay = new FrameLayout(this);
        loadingOverlay.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        loadingOverlay.setBackgroundColor(Color.BLACK);

        // Full-screen Video-Matched Native Canvas (Pure White Slow-Motion Outline-to-Fill + Bouncing M + Mirror)
        nativeSplashView = new VideoMatchedSplashView(this);
        nativeSplashView.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        loadingOverlay.addView(nativeSplashView);

        // Subtle Bottom Status & Action Container (hidden spinner during video intro so stage stays pure)
        LinearLayout bottomControls = new LinearLayout(this);
        bottomControls.setOrientation(LinearLayout.VERTICAL);
        bottomControls.setGravity(Gravity.CENTER);
        FrameLayout.LayoutParams bottomParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL
        );
        bottomParams.bottomMargin = dpToPx(36);
        int hPad = dpToPx(24);
        bottomControls.setPadding(hPad, dpToPx(8), hPad, dpToPx(8));

        loadingSpinner = new ProgressBar(this);
        loadingSpinner.setIndeterminateTintList(android.content.res.ColorStateList.valueOf(Color.WHITE));
        LinearLayout.LayoutParams spinnerParams = new LinearLayout.LayoutParams(
                dpToPx(26), dpToPx(26)
        );
        spinnerParams.bottomMargin = dpToPx(8);
        loadingSpinner.setLayoutParams(spinnerParams);
        loadingSpinner.setVisibility(View.GONE);

        loadingStatusText = new TextView(this);
        loadingStatusText.setText("লোড হচ্ছে...");
        loadingStatusText.setTextColor(Color.parseColor("#94A3B8"));
        loadingStatusText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        loadingStatusText.setGravity(Gravity.CENTER);
        loadingStatusText.setVisibility(View.GONE);

        retryButton = new Button(this);
        retryButton.setText("পুনরায় চেষ্টা করুন (Retry)");
        retryButton.setVisibility(View.GONE);
        retryButton.setBackgroundColor(Color.WHITE);
        retryButton.setTextColor(Color.BLACK);
        LinearLayout.LayoutParams btnParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        btnParams.topMargin = dpToPx(14);
        retryButton.setLayoutParams(btnParams);
        retryButton.setOnClickListener(v -> loadPage(TARGET_URL, true));

        skipIntroButton = new Button(this);
        skipIntroButton.setText("প্রবেশ করুন →");
        skipIntroButton.setAllCaps(false);
        skipIntroButton.setBackgroundColor(Color.TRANSPARENT);
        skipIntroButton.setTextColor(Color.parseColor("#9CA3AF"));
        skipIntroButton.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        skipIntroButton.setMinimumHeight(dpToPx(44));
        skipIntroButton.setOnClickListener(v -> {
            nativeSplashCompleted = true;
            if (nativeSplashView != null) {
                nativeSplashView.jumpToSettled();
            }
            if (pageRenderedSuccessfully) {
                hideLoadingOverlay();
            } else {
                showLoadingState();
            }
        });

        bottomControls.addView(loadingSpinner);
        bottomControls.addView(loadingStatusText);
        bottomControls.addView(retryButton);
        bottomControls.addView(skipIntroButton);
        loadingOverlay.addView(bottomControls, bottomParams);
        parent.addView(loadingOverlay);

        nativeSplashView.startAnimation(() -> {
            nativeSplashCompleted = true;
            if (isLoadFailedState) return;
            if (pageRenderedSuccessfully) {
                hideLoadingOverlay();
            } else {
                showLoadingState();
            }
        });
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
        isLoadFailedState = false;
        loadingOverlay.setAlpha(1f);
        loadingOverlay.setVisibility(View.VISIBLE);
        if (retryButton != null) retryButton.setVisibility(View.GONE);
        if (nativeSplashCompleted) {
            if (loadingSpinner != null) loadingSpinner.setVisibility(View.VISIBLE);
            if (loadingStatusText != null) {
                loadingStatusText.setVisibility(View.VISIBLE);
                loadingStatusText.setText("লোড হচ্ছে...");
            }
            if (skipIntroButton != null) skipIntroButton.setVisibility(View.GONE);
        } else {
            if (loadingSpinner != null) loadingSpinner.setVisibility(View.GONE);
            if (loadingStatusText != null) loadingStatusText.setVisibility(View.GONE);
            if (skipIntroButton != null) skipIntroButton.setVisibility(View.VISIBLE);
        }
    }

    private void hideLoadingOverlay() {
        if (loadingOverlay == null || loadingOverlay.getVisibility() != View.VISIBLE) {
            return;
        }
        // Let the 7.8s native slow-motion intro finish cleanly before revealing the WebView
        if (!nativeSplashCompleted) {
            return;
        }
        long elapsed = Math.max(0L, System.currentTimeMillis() - nativeSplashStartedAtMs);
        if (webView != null) {
            try {
                webView.evaluateJavascript(
                        "window.__marketbdNativeIntroActive=true;window.__marketbdNativeIntroElapsed=" + elapsed + ";",
                        null
                );
            } catch (Exception ignored) {
            }
        }
        loadingOverlay.animate()
                .alpha(0f)
                .setDuration(400L)
                .setListener(new AnimatorListenerAdapter() {
                    @Override
                    public void onAnimationEnd(Animator animation) {
                        if (loadingOverlay != null) {
                            loadingOverlay.setVisibility(View.GONE);
                            loadingOverlay.setAlpha(1f);
                        }
                    }
                })
                .start();
    }

    private void handleMainFrameLoadFailure() {
        cancelLoadWatchdog();
        isLoadFailedState = true;
        nativeSplashCompleted = true;
        if (nativeSplashView != null) {
            nativeSplashView.jumpToSettled();
        }
        if (swipeRefreshLayout != null && swipeRefreshLayout.isRefreshing()) {
            swipeRefreshLayout.setRefreshing(false);
        }
        if (loadingOverlay != null) {
            loadingOverlay.animate().cancel();
            loadingOverlay.setAlpha(1f);
            loadingOverlay.setVisibility(View.VISIBLE);
        }
        if (loadingSpinner != null) loadingSpinner.setVisibility(View.GONE);
        if (skipIntroButton != null) skipIntroButton.setVisibility(View.GONE);
        if (retryButton != null) retryButton.setVisibility(View.VISIBLE);
        if (loadingStatusText != null) {
            loadingStatusText.setVisibility(View.VISIBLE);
            loadingStatusText.setText(isNetworkAvailable()
                    ? "সার্ভারের সাথে সংযোগ হতে সময় লাগছে। দয়া করে Retry চাপুন।"
                    : "ইন্টারনেট সংযোগ নেই। ওয়াইফাই বা মোবাইল ডাটা চালু করে Retry চাপুন।");
        }
    }

    /**
     * Custom hardware-accelerated View rendering the 7.8s slow-motion pure-white intro animation:
     *   1) "Welcome to" small crisp white fade-in
     *   2) Left-to-right baseline white sweep line curving cleanly into letter 'a'
     *   3) Slow-motion left-to-right per-letter vector outline tracing via PathMeasure
     *   4) Slow-motion progressive left-to-right hollow outline -> solid white fill
     *   5) Hopping "M" arcing across the wordmark and landing into its left slot
     *   6) Real-time synchronized vertical mirror floor reflection underneath
     */
    private static final class VideoMatchedSplashView extends View {
        private static final String WORDMARK = "MarketBD";
        private static final long ANIM_DURATION_MS = 7800L;
        private static final long HOLD_DURATION_MS = 650L;

        private final Paint welcomePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint mFillPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint fillPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint sweepPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint reflectionMaskPaint = new Paint(Paint.ANTI_ALIAS_FLAG);

        private final Path[] charPaths = new Path[WORDMARK.length()];
        private final float[] charPathLengths = new float[WORDMARK.length()];
        private final float[] charXs = new float[WORDMARK.length()];
        private final Path sweepPath = new Path();
        private final Path reusableDstPath = new Path();
        private final PathMeasure reusablePm = new PathMeasure();

        private ValueAnimator progressAnimator;
        private float animProgress = 0f;
        private float wordWidth = 0f;
        private float capHeight = 0f;
        private float mAdvance = 0f;
        private float strokeBasePx = 3f;
        private float density = 2f;
        private boolean geometryReady = false;
        private Shader reflectionMaskShader;
        private float maskTopY = -1f;
        private float maskBottomY = -1f;

        VideoMatchedSplashView(Context context) {
            super(context);
            density = context.getResources().getDisplayMetrics().density;
            strokeBasePx = Math.max(2f, 1.55f * density);

            Typeface welcomeTf = Typeface.create("sans-serif-medium", Typeface.NORMAL);
            welcomePaint.setColor(Color.WHITE);
            welcomePaint.setTypeface(welcomeTf);
            welcomePaint.setTextAlign(Paint.Align.CENTER);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                welcomePaint.setLetterSpacing(0.22f);
            }
            welcomePaint.setTextSize(TypedValue.applyDimension(
                    TypedValue.COMPLEX_UNIT_SP, 14, context.getResources().getDisplayMetrics()));

            Typeface heavyTf = Typeface.create("sans-serif-black", Typeface.BOLD);
            fillPaint.setColor(Color.WHITE);
            fillPaint.setStyle(Paint.Style.FILL);
            fillPaint.setTypeface(heavyTf);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                fillPaint.setLetterSpacing(-0.02f);
            }

            mFillPaint.setColor(Color.parseColor("#E50914"));
            mFillPaint.setStyle(Paint.Style.FILL);
            mFillPaint.setTypeface(heavyTf);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mFillPaint.setLetterSpacing(-0.02f);
            }

            strokePaint.setColor(Color.WHITE);
            strokePaint.setStyle(Paint.Style.STROKE);
            strokePaint.setStrokeJoin(Paint.Join.ROUND);
            strokePaint.setStrokeCap(Paint.Cap.ROUND);
            strokePaint.setStrokeWidth(strokeBasePx);

            sweepPaint.setColor(Color.WHITE);
            sweepPaint.setStyle(Paint.Style.STROKE);
            sweepPaint.setStrokeCap(Paint.Cap.ROUND);
            sweepPaint.setStrokeJoin(Paint.Join.ROUND);
            sweepPaint.setStrokeWidth(Math.max(2f, 1.6f * density));

            for (int i = 0; i < WORDMARK.length(); i++) {
                charPaths[i] = new Path();
            }
        }

        void startAnimation(final Runnable onComplete) {
            stopAnimation();
            animProgress = 0f;
            progressAnimator = ValueAnimator.ofFloat(0f, 1f);
            progressAnimator.setDuration(ANIM_DURATION_MS);
            progressAnimator.setInterpolator(new LinearInterpolator());
            progressAnimator.addUpdateListener(animation -> {
                animProgress = (float) animation.getAnimatedValue();
                invalidate();
            });
            progressAnimator.addListener(new AnimatorListenerAdapter() {
                private boolean cancelled = false;

                @Override
                public void onAnimationCancel(Animator animation) {
                    cancelled = true;
                }

                @Override
                public void onAnimationEnd(Animator animation) {
                    if (cancelled || onComplete == null) return;
                    postDelayed(onComplete, HOLD_DURATION_MS);
                }
            });
            progressAnimator.start();
        }

        void jumpToSettled() {
            stopAnimation();
            animProgress = 1f;
            invalidate();
        }

        void stopAnimation() {
            if (progressAnimator != null) {
                progressAnimator.cancel();
                progressAnimator = null;
            }
        }

        @Override
        protected void onSizeChanged(int w, int h, int oldw, int oldh) {
            super.onSizeChanged(w, h, oldw, oldh);
            if (w <= 0 || h <= 0) return;

            float targetWidth = w * 0.80f;
            float testSize = Math.min(w * 0.165f, 64f * density);
            fillPaint.setTextSize(testSize);
            float measured = fillPaint.measureText(WORDMARK);
            if (measured > targetWidth && measured > 0f) {
                testSize = testSize * (targetWidth / measured);
                fillPaint.setTextSize(testSize);
                measured = fillPaint.measureText(WORDMARK);
            }
            mFillPaint.setTextSize(testSize);
            wordWidth = measured;
            mAdvance = fillPaint.measureText(WORDMARK, 0, 1);

            android.graphics.Rect bounds = new android.graphics.Rect();
            fillPaint.getTextBounds("M", 0, 1, bounds);
            capHeight = Math.max(testSize * 0.72f, bounds.height());

            for (int i = 0; i < WORDMARK.length(); i++) {
                charXs[i] = (i == 0) ? 0f : fillPaint.measureText(WORDMARK, 0, i);
                charPaths[i].reset();
                fillPaint.getTextPath(WORDMARK, i, i + 1, charXs[i], 0f, charPaths[i]);

                reusablePm.setPath(charPaths[i], false);
                float totalLen = 0f;
                do {
                    totalLen += reusablePm.getLength();
                } while (reusablePm.nextContour());
                charPathLengths[i] = totalLen;
            }

            float wordLeftX = (w - wordWidth) * 0.5f;
            float aStartX = charXs[1];
            float curveR = Math.min(20f * density, capHeight * 0.35f);
            sweepPath.reset();
            sweepPath.moveTo(-(wordLeftX + 24f * density), 0f);
            sweepPath.lineTo(aStartX - curveR, 0f);
            sweepPath.quadTo(aStartX, 0f, aStartX, -capHeight * 0.56f);

            geometryReady = true;
            reflectionMaskShader = null;
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            canvas.drawColor(Color.BLACK);
            if (!geometryReady) return;

            float w = getWidth();
            float h = getHeight();
            float wordLeftX = (w - wordWidth) * 0.5f;
            float baselineY = h * 0.50f;

            // 1. Small Crisp White "Welcome to" centered neatly above MarketBD
            float welcomeAlpha = clamp01(animProgress / 0.14f);
            float welcomeDropY = lerp(-6f * density, 0f, easeOutCubic(welcomeAlpha));
            welcomePaint.setAlpha(Math.round(255f * welcomeAlpha));
            float welcomeY = baselineY - capHeight - 18f * density + welcomeDropY;
            canvas.drawText("Welcome to", w * 0.5f, welcomeY, welcomePaint);

            // 2. Upright Primary Wordmark (Red M + White arketBD)
            drawWordmarkPass(canvas, wordLeftX, baselineY, false, 1f);

            // 3. Synchronized Floor Mirror Reflection (directly below baseline)
            float reflectBaselineY = baselineY + Math.max(2f, 1.5f * density);
            drawWordmarkPass(canvas, wordLeftX, reflectBaselineY, true, 0.54f);

            // 4. Smooth Black Floor Mirror Fade Gradient
            float maskBottom = reflectBaselineY + capHeight * 0.92f;
            if (reflectionMaskShader == null || Math.abs(maskTopY - reflectBaselineY) > 1f || Math.abs(maskBottomY - maskBottom) > 1f) {
                maskTopY = reflectBaselineY;
                maskBottomY = maskBottom;
                reflectionMaskShader = new LinearGradient(
                        0f,
                        reflectBaselineY,
                        0f,
                        maskBottom,
                        new int[]{Color.argb(40, 0, 0, 0), Color.argb(205, 0, 0, 0), Color.BLACK},
                        new float[]{0f, 0.48f, 1f},
                        Shader.TileMode.CLAMP
                );
                reflectionMaskPaint.setShader(reflectionMaskShader);
            }
            canvas.drawRect(0f, reflectBaselineY, w, maskBottom + 12f * density, reflectionMaskPaint);
        }

        private void drawWordmarkPass(Canvas canvas, float wordLeftX, float baselineY, boolean flipped, float baseOpacity) {
            canvas.save();
            canvas.translate(wordLeftX, baselineY);
            if (flipped) {
                canvas.scale(1f, -1f);
            }

            float p = animProgress;

            // A. Left-to-Right Baseline Sweep Line + Curved Hook (0.00 -> 0.36)
            if (p <= 0.37f) {
                reusablePm.setPath(sweepPath, false);
                float totalSweepLen = reusablePm.getLength();
                float headFrac = easeOutCubic(clamp01(p / 0.16f));
                float tailFrac = p <= 0.15f ? 0f : easeInOutCubic(clamp01((p - 0.15f) / 0.21f));
                float headPx = headFrac * totalSweepLen;
                float tailPx = tailFrac * totalSweepLen;
                if (headPx - tailPx > 0.5f && tailFrac < 0.99f) {
                    reusableDstPath.reset();
                    reusablePm.getSegment(tailPx, headPx, reusableDstPath, true);
                    sweepPaint.setAlpha(Math.round(245f * baseOpacity));
                    canvas.drawPath(reusableDstPath, sweepPaint);
                }
            }

            // B. Left-to-Right Per-Letter White Outline Tracing (0.09 -> 0.42)
            //    followed by Progressive Solid White Fill (0.42 -> 0.77) on "arketBD"
            for (int i = 1; i < WORDMARK.length(); i++) {
                int idx = i - 1; // 0..6 ('a'..'D')
                float outlineStart = 0.09f + idx * 0.032f;
                float outlineFrac = easeInOutCubic((p - outlineStart) / 0.12f);

                float fillStart = 0.42f + idx * 0.036f;
                float fillFrac = easeInOutCubic((p - fillStart) / 0.12f);

                if (outlineFrac > 0f && fillFrac < 0.99f) {
                    float targetDist = charPathLengths[i] * outlineFrac;
                    reusablePm.setPath(charPaths[i], false);
                    reusableDstPath.reset();
                    float remaining = targetDist;
                    do {
                        float contourLen = reusablePm.getLength();
                        if (contourLen <= 0f) continue;
                        if (remaining >= contourLen) {
                            reusablePm.getSegment(0f, contourLen, reusableDstPath, true);
                            remaining -= contourLen;
                        } else if (remaining > 0f) {
                            reusablePm.getSegment(0f, remaining, reusableDstPath, true);
                            remaining = 0f;
                        }
                    } while (remaining > 0f && reusablePm.nextContour());

                    float strokeAlpha = Math.max(0f, 1f - fillFrac * 0.9f) * baseOpacity;
                    strokePaint.setAlpha(Math.round(255f * strokeAlpha));
                    strokePaint.setStrokeWidth(lerp(strokeBasePx, strokeBasePx * 0.35f, fillFrac));
                    canvas.drawPath(reusableDstPath, strokePaint);
                }

                if (fillFrac > 0f) {
                    fillPaint.setAlpha(Math.round(255f * fillFrac * baseOpacity));
                    canvas.drawPath(charPaths[i], fillPaint);
                }
            }

            // C. Slow-Motion Bouncing RED "M" Arc Across Tops & Final Left Landing (0.43 -> 0.92)
            if (p >= 0.43f) {
                float mAlpha;
                float mX = 0f;
                float mY = 0f;
                float mScaleX = 1f;
                float mScaleY = 1f;
                float mRot = 0f;

                float mPivotX = charXs[0] + mAdvance * 0.5f;
                float hopLeftX = (charXs[1] + capHeight * 0.3f) - mPivotX;
                float hopMidX = wordWidth * 0.54f - mPivotX;
                float hopRightX = wordWidth * 0.86f - mPivotX;

                if (p < 0.49f) {
                    float k = easeOutCubic((p - 0.43f) / 0.06f);
                    mAlpha = k;
                    mX = hopLeftX;
                    mY = lerp(-capHeight * 0.88f, -capHeight * 1.24f, k);
                    float sc = lerp(0.32f, 0.41f, k);
                    mScaleX = sc;
                    mScaleY = sc;
                    mRot = 0f;
                } else if (p < 0.62f) {
                    float k = (p - 0.49f) / 0.13f;
                    float arcLift = (float) Math.sin(k * Math.PI) * (capHeight * 0.50f);
                    mAlpha = 1f;
                    mX = lerp(hopLeftX, hopMidX, easeInOutCubic(k));
                    mY = lerp(-capHeight * 1.24f, -capHeight * 1.48f, k) - arcLift;
                    float sc = lerp(0.41f, 0.38f, k);
                    mScaleX = sc;
                    mScaleY = sc;
                    mRot = lerp(0f, 19f, easeInOutCubic(k));
                } else if (p < 0.74f) {
                    float k = (p - 0.62f) / 0.12f;
                    float arcLift = (float) Math.sin(k * Math.PI) * (capHeight * 0.38f);
                    mAlpha = 1f;
                    mX = lerp(hopMidX, hopRightX, easeInOutCubic(k));
                    mY = lerp(-capHeight * 1.48f, -capHeight * 1.32f, k) - arcLift;
                    mScaleX = 0.37f;
                    mScaleY = 0.37f;
                    mRot = lerp(19f, 27f, easeInOutCubic(k));
                } else if (p < 0.87f) {
                    float k = (p - 0.74f) / 0.13f;
                    float eased = easeInOutCubic(k);
                    float arcLift = (float) Math.sin(k * Math.PI) * (capHeight * 0.88f);
                    mAlpha = 1f;
                    mX = lerp(hopRightX, 0f, eased);
                    mY = lerp(-capHeight * 1.32f, 0f, eased) - arcLift;
                    float sc = lerp(0.37f, 1.0f, eased);
                    mScaleX = sc;
                    mScaleY = sc;
                    mRot = k < 0.55f ? lerp(27f, -16f, k / 0.55f) : lerp(-16f, 0f, (k - 0.55f) / 0.45f);
                } else if (p < 0.92f) {
                    float k = (p - 0.87f) / 0.05f;
                    mAlpha = 1f;
                    if (k < 0.45f) {
                        float s = k / 0.45f;
                        mScaleX = lerp(1.0f, 1.04f, s);
                        mScaleY = lerp(1.0f, 0.94f, s);
                    } else {
                        float s = (k - 0.45f) / 0.55f;
                        mScaleX = lerp(1.04f, 1.0f, s);
                        mScaleY = lerp(0.94f, 1.0f, s);
                    }
                } else {
                    mAlpha = 1f;
                }

                canvas.save();
                canvas.translate(mX, mY);
                canvas.rotate(mRot, mPivotX, -capHeight * 0.42f);
                canvas.scale(mScaleX, mScaleY, mPivotX, 0f);
                mFillPaint.setAlpha(Math.round(255f * mAlpha * baseOpacity));
                canvas.drawPath(charPaths[0], mFillPaint);
                canvas.restore();
            }

            canvas.restore();
        }

        private static float clamp01(float v) {
            return v < 0f ? 0f : (v > 1f ? 1f : v);
        }

        private static float easeInOutCubic(float t) {
            float x = clamp01(t);
            return x < 0.5f ? 4f * x * x * x : 1f - (float) Math.pow(-2f * x + 2f, 3) / 2f;
        }

        private static float easeOutCubic(float t) {
            float x = clamp01(t);
            return 1f - (float) Math.pow(1f - x, 3);
        }

        private static float lerp(float a, float b, float t) {
            return a + (b - a) * t;
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
        if (nativeSplashView != null) {
            nativeSplashView.stopAnimation();
        }
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
