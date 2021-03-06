import React from "react";
import { useContext, useEffect, useRef, useState, useLayoutEffect } from "react";
import { AppContext } from "./AppProvider";
import { getCanvasProps } from "./stageProps";
import { createUnmount } from "./render";
import { createPixiApplication } from "./utils";
import { ReactPixiFiberAsSecondaryRenderer } from "./ReactPixiFiber";

export function usePixiApp() {
  return useContext(AppContext);
}

export function usePixiTicker(fn) {
  const { ticker } = usePixiApp();

  useEffect(() => {
    ticker.add(fn);

    return () => {
      ticker.remove(fn);
    };
  }, [fn, ticker]);
}

export function usePreviousProps(value) {
  const ref = useRef({});

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

export function usePixiAppCreator(props) {
  const { options, width, height } = props;
  const canvasRef = useRef();
  const [app, setApp] = useState(null);
  const canvasProps = getCanvasProps(props);
  // Do not render anything if view is passed to options
  const canvas = options && options.view ? null : <canvas ref={canvasRef} {...canvasProps} />;

  // Initialize pixi application on mount
  useLayoutEffect(() => {
    const unmount = createUnmount(ReactPixiFiberAsSecondaryRenderer);
    const view = canvasRef.current;
    const appInstance = createPixiApplication({ height, width, view, ...options });

    setApp(appInstance);

    // Destroy pixi application on unmount
    return () => {
      unmount(appInstance.stage);
      appInstance.destroy();
    };
  }, [options, width, height]);

  return { app, canvas };
}
