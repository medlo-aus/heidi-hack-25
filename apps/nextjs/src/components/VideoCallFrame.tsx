import { useEffect, useRef, useCallback, useState } from "react";
import { useCallFrame } from "@daily-co/daily-react";
import type { DailyCall } from "@daily-co/daily-js";

interface DailyCallFrameProps {
  roomUrl: string;
  onMeetingLeft?: () => void;
  onMeetingJoined?: () => void;
  onMediaStarted?: () => void;
  onError?: (error: any) => void;
  isExiting?: boolean; /* Prevent rejoining when exit is in progress */
}

export default function VideoCallFrame({ 
  roomUrl, 
  onMeetingLeft, 
  onMeetingJoined,
  onMediaStarted,
  onError,
  isExiting = false 
}: DailyCallFrameProps) {
  // Where the Daily iframe will live - using callback ref to properly handle types
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  /* Track if video/audio has started to show helpful hints */
  const [mediaStarted, setMediaStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
  }, []);

  /**
   * useCallFrame creates (or reuses) a single Daily call-frame.
   * Passing parentElRef attaches the iframe for us, so we NEVER call attach().
   */
  const callFrame: DailyCall | null = useCallFrame({
    parentElRef: containerRef as React.MutableRefObject<HTMLElement>,         // <- type assertion for Daily
  });

  /* Style the iframe once it's loaded and ensure proper focus */
  useEffect(() => {
    if (!callFrame || isExiting) return;

    // Apply styling to the iframe when it becomes available
    const styleIframe = () => {
      const iframe = callFrame.iframe();
      if (iframe) {
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "1px solid var(--border)";
        iframe.style.borderRadius = "0.5rem";
        iframe.style.backgroundColor = "var(--background)";
        
        /* 
         * Ensure iframe can receive focus and user interaction.
         * This helps with browser autoplay policies that require user interaction.
         */
        iframe.setAttribute('tabindex', '0');
        iframe.style.outline = 'none';
        
        /* Focus the iframe after a short delay to ensure it's ready */
        setTimeout(() => {
          iframe.focus();
          console.log("[VideoCallFrame] Focused iframe for user interaction");
        }, 500);
      }
    };

    // Try to style immediately and also on load event
    styleIframe();
    
    const handleLoaded = () => {
      styleIframe();
    };

    /* 
     * Additional event handlers to ensure media starts properly
     */
    const handleJoinedMeeting = () => {
      console.log("[VideoCallFrame] Joined meeting successfully");
      onMeetingJoined?.();
      const iframe = callFrame.iframe();
      if (iframe) {
        /* Trigger a click event to satisfy browser interaction requirements */
        setTimeout(() => {
          iframe.focus();
          iframe.click();
          console.log("[VideoCallFrame] Triggered iframe interaction after joining");
        }, 100);
      }
    };

    callFrame.on("loaded", handleLoaded);
    callFrame.on("joined-meeting", handleJoinedMeeting);

    return () => {
      callFrame.off("loaded", handleLoaded);
      callFrame.off("joined-meeting", handleJoinedMeeting);
    };
  }, [callFrame, isExiting, onMeetingJoined]);

  /* Join/leave lifecycle */
  useEffect(() => {
    if (!callFrame || isExiting) return;

    const state = callFrame.meetingState();
    if (state === "new" || state === "left-meeting" || state === "error") {
      /* Join with explicit media settings to help with autoplay issues */
      void callFrame.join({ 
        url: roomUrl,
        /* 
         * Start with camera and microphone enabled to trigger permission prompts immediately.
         * This helps browsers understand this is an intentional video call.
         */
        startVideoOff: false,
        startAudioOff: false
      });
    }

    /* Show hint after 3 seconds if media hasn't started */
    const hintTimer = setTimeout(() => {
      if (!mediaStarted) {
        setShowHint(true);
        console.log("[VideoCallFrame] Showing interaction hint");
      }
    }, 3000);

    const handleLeftMeeting = () => {
      console.log("[VideoCallFrame] Left meeting event triggered");
      onMeetingLeft?.();
    };

    const handleError = (e: any) => {
      console.error("[VideoCallFrame] Daily error:", e);
      onError?.(e);
    };

    /* Track when participants start their video/audio */
    const handleParticipantUpdated = (event: any) => {
      const { participant } = event;
      if (participant?.local && (participant?.video || participant?.audio)) {
        setMediaStarted(true);
        setShowHint(false); /* Hide hint once media starts */
        onMediaStarted?.();
        console.log("[VideoCallFrame] Local media started");
      }
    };

    callFrame.on("left-meeting", handleLeftMeeting);
    callFrame.on("error", handleError);
    callFrame.on("participant-updated", handleParticipantUpdated);

    // Cleanup function
    return () => {
      clearTimeout(hintTimer);
      callFrame.off("left-meeting", handleLeftMeeting);
      callFrame.off("error", handleError);
      callFrame.off("participant-updated", handleParticipantUpdated);
    };
  }, [callFrame, roomUrl, isExiting, onMeetingLeft, onError, onMediaStarted, mediaStarted]);

  /* Handle exit state - immediately leave and cleanup when exiting starts */
  useEffect(() => {
    if (isExiting && callFrame) {
      console.log("[VideoCallFrame] Exiting - immediately leaving call");
      void callFrame.leave().catch(() => {}); /* Leave immediately when exit starts */
    }
  }, [isExiting, callFrame]);

  // Separate effect for final cleanup on unmount
  useEffect(() => {
    return () => {
      if (callFrame) {
        void callFrame.leave().catch(() => {});
        callFrame.destroy();
      }
    };
  }, []);

  return (
    <div className="flex w-full items-center justify-center p-4">
      <div className="relative h-[80vh] w-full max-w-7xl rounded-lg bg-background">
        {/* Daily puts its iframe inside here */}
        <div 
          ref={setContainerRef} 
          className="h-full w-full rounded-lg border border-border overflow-hidden cursor-pointer"
          style={{
            borderRadius: "0.5rem",
          }}
          /* 
           * Add click handler to container to ensure user interaction is registered.
           * This helps with browser autoplay policies.
           */
          onClick={() => {
            if (callFrame) {
              const iframe = callFrame.iframe();
              if (iframe) {
                iframe.focus();
                console.log("[VideoCallFrame] Container clicked, focused iframe");
              }
            }
            /* Dismiss hint when user clicks */
            setShowHint(false);
          }}
          /* Make container focusable for keyboard navigation */
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (callFrame) {
                const iframe = callFrame.iframe();
                if (iframe) {
                  iframe.focus();
                  iframe.click();
                  console.log("[VideoCallFrame] Container activated via keyboard");
                }
              }
            }
          }}
        />
        {(!callFrame || isExiting) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p>{isExiting ? "Ending call..." : "Loading video…"}</p>
          </div>
        )}
        {/* Show helpful hint if media hasn't started after some time */}
        {callFrame && !isExiting && !mediaStarted && showHint && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/90 border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
            💡 Click anywhere in the video area if camera doesn't start automatically
          </div>
        )}
      </div>
    </div>
  );
} 