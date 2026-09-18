import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSceneForRoute } from './animationConfig';

const AnimationContext = createContext({
  scene: null,
  setScene: () => {},
  opacity: 0.75,
  setOpacity: () => {},
  isRegistered: false,
});

export const AnimationProvider = ({ children }) => {
  const location = useLocation();
  const [scene, setScene] = useState(null);
  const [opacity, setOpacity] = useState(0.75);

  // When location changes, reset explicit override so route-based matching takes over
  useEffect(() => {
    setScene(null);
  }, [location.pathname]);

  const effectiveScene = scene || getSceneForRoute(location.pathname);

  return (
    <AnimationContext.Provider
      value={{
        scene: effectiveScene,
        setScene,
        opacity,
        setOpacity,
        isRegistered: true,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => useContext(AnimationContext);
