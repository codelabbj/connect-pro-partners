package com.example.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Enable WebView debugging
        WebView.setWebContentsDebuggingEnabled(true);

        super.onCreate(savedInstanceState);
    }
}
