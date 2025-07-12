import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Clipboard, Clock, Loader, Shield, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { ConsultIdsNavigator } from "../components/ConsultIdsNavigator";
import { HeidiIcon } from "../components/Icons";
import { api } from "../utils/api";

export default function Home() {
  const getSessionMutation = api.public.getSession.useMutation({});

  const getHeidiSessionMutation = api.public.getHeidiSession.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: Infinity,
      refetchOnReconnect: false,

      refetchIntervalInBackground: false,
    },
  );

  const [recording, setRec] = useState(false);
  const chunkIndex = useRef(0);
  const recorder = useRef<MediaRecorder>();

  const start = async () => {
    try {
      // 1: open Heidi session + get recording_id from server
      // await api.transcription.start.mutate(); // returns { sessionId, recordingId }
      console.log("start");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus", // widely supported; Heidi accepts .ogg
        audioBitsPerSecond: 48_000,
      });

      recorder.current.ondataavailable = async (e) => {
        if (!e.data.size) return;
        const arrayBuf = await e.data.arrayBuffer();
        console.log(arrayBuf);
        // await trpc.transcription.uploadChunk.mutate({
        //   data: new Uint8Array(arrayBuf),
        //   index: chunkIndex.current++,
        // });
      };

      recorder.current.start(1000); // 1 s timeslice ⇒ ondataavailable every second
      setRec(true);
    } catch (error) {
      console.error(error);
      toast.error("Error starting recording: " + error);
    }
  };

  const stop = async () => {
    recorder.current?.stop();
    // await trpc.transcription.finish.mutate(); // tells Heidi “:finish”

    /* 
      Stop all media tracks to turn off microphone access and remove the recording indicator
      This ensures the browser stops requesting audio permissions and cleans up the media stream
    */
    recorder.current?.stream?.getTracks().forEach((track) => track.stop());

    console.log("stop");
    setRec(false);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center">
      <header className="absolute top-0 z-50 w-full bg-transparent">
        <div className="container mx-auto flex h-14 items-center px-2 sm:px-4">
          <div className="mr-4 flex items-center">
            <Link href="/">
              <div className="mr-2 w-fit overflow-clip rounded-lg border border-black/10">
                <Image
                  src="/heidi.png"
                  alt="Last Mile"
                  width={40}
                  height={40}
                />
              </div>
            </Link>
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <span className="inline-block text-xl font-extrabold text-black">
                Heidi
              </span>
            </Link>
          </div>
        </div>
      </header>
      <HeidiIcon className="absolute left-0 top-0 -z-10 h-[240px] w-full" />

      <main className="prose flex-1">
        <div className="container mx-auto flex flex-col items-center gap-4 py-8">
          <Button onClick={start}>Start</Button>
          <Button onClick={stop}>Stop</Button>
          <ConsultIdsNavigator />
          <Button
            // onClick={() => getHeidiSessionMutation()}
            disabled={getHeidiSessionMutation.isPending}
          >
            {getHeidiSessionMutation.isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Fetching session...
              </>
            ) : (
              "Get Session"
            )}
          </Button>

          {getHeidiSessionMutation.data && (
            <pre className="max-w-lg whitespace-pre-wrap rounded-lg bg-neutral-900 p-4 text-white">
              {JSON.stringify(getHeidiSessionMutation.data, null, 2)}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}
