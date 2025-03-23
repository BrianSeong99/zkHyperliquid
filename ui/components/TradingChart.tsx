import React, { useEffect, useRef, memo } from "react";

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Check if script already exists to prevent duplicates
    if (container.current && !container.current.querySelector("script")) {
      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "autosize": true,
          "symbol": "COINBASE:POLUSDC",
          "interval": "60",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "withdateranges": true,
          "hide_side_toolbar": false,
          "allow_symbol_change": false,
          "calendar": false,
          "support_host": "https://www.tradingview.com"
        }`;

      container.current.appendChild(script);
      scriptRef.current = script;
    }

    // Cleanup function to remove the script when component unmounts
    return () => {
      if (scriptRef.current && container.current) {
        container.current.removeChild(scriptRef.current);
      }
    };
  }, []);

  return (
    <div className="rounded-lg overflow-hidden h-full w-full">
      <div className="tradingview-widget-container" ref={container}></div>
    </div>
  );
}

export default memo(TradingViewWidget);
