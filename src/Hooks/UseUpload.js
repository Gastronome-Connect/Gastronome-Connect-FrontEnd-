import { useState, useRef, useCallback } from "react";

/**
 * useUpload
 * Manages real upload simulation with XHR progress tracking.
 * Swap the simulateUpload body for a real fetch/axios call with onUploadProgress.
 *
 * Returns:
 *   uploadState  - "idle" | "uploading" | "success" | "failed"
 *   progress     - 0–100
 *   startUpload  - (postData, onSuccess) => void
 *   retryUpload  - () => void   (retries last upload)
 *   cancelUpload - () => void
 */
const useUpload = () => {
  const [uploadState, setUploadState] = useState("idle");
  const [progress,    setProgress]    = useState(0);

  const pendingRef  = useRef(null); // { postData, onSuccess }
  const timerRefs   = useRef([]);

  const clearTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  };

  const simulateUpload = useCallback((postData, onSuccess) => {
    clearTimers();
    setProgress(0);
    setUploadState("uploading");

    // ── Simulate XHR progress ticks ──
    // Replace this block with real XHR / axios onUploadProgress:
    //
    //   const xhr = new XMLHttpRequest();
    //   xhr.upload.onprogress = (e) => {
    //     if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    //   };
    //   xhr.onload  = () => { setUploadState("success"); onSuccess(postData); }
    //   xhr.onerror = () => setUploadState("failed");
    //   xhr.open("POST", "/api/posts");
    //   xhr.send(formData);

    const FAIL_RANDOMLY = false; // set true to test failure flow

    const steps = [
      [300,  15],
      [700,  35],
      [1100, 58],
      [1500, 74],
      [1900, 88],
      [2200, 96],
      [2500, 100],
    ];

    steps.forEach(([delay, pct]) => {
      const t = setTimeout(() => setProgress(pct), delay);
      timerRefs.current.push(t);
    });

const finishDelay = setTimeout(() => {
  if (FAIL_RANDOMLY && Math.random() < 0.4) {
    setUploadState("failed");
    return;
  }

  setUploadState("success");

  // simulate a real backend response
  const posted = {
    ...postData,
    id: Date.now(),                 // unique id so React updates
    date: new Date().toLocaleString()
  };

  onSuccess(posted);
}, 2700);

    timerRefs.current.push(finishDelay);
  }, []);

  const startUpload = useCallback((postData, onSuccess) => {
    pendingRef.current = { postData, onSuccess };
    simulateUpload(postData, onSuccess);
  }, [simulateUpload]);

  const retryUpload = useCallback(() => {
    if (!pendingRef.current) return;
    const { postData, onSuccess } = pendingRef.current;
    simulateUpload(postData, onSuccess);
  }, [simulateUpload]);

  const cancelUpload = useCallback(() => {
    clearTimers();
    setUploadState("idle");
    setProgress(0);
    pendingRef.current = null;
  }, []);

  const resetUpload = useCallback(() => {
    setUploadState("idle");
    setProgress(0);
  }, []);

  return { uploadState, progress, startUpload, retryUpload, cancelUpload, resetUpload };
};

export default useUpload;