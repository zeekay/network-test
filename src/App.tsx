"use client";

import {
  ConvexReactClient,
  useConvex,
  useConvexConnectionState,
  useMutation,
  useQuery,
} from "convex/react";
import { ConvexProvider } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api.js";
import { createProxiedWebSocketClass } from "@convex-dev/sse-proxied-websocket";

export default function App() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-indigo-700 text-white p-4 border-b-2 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center">
          <img src="/convex.svg" alt="Convex" className="h-8 mr-3" />
          <h1 className="text-xl font-bold">Convex Connection Tester</h1>
        </div>
      </header>
      <main className="p-8 flex flex-col gap-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-center text-indigo-800">
          Browser Network Test
        </h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto">
          This tool tests your browser's ability to connect to Convex services
          using different protocols.
        </p>
        <Content />
      </main>
    </>
  );
}

const SITE_URL = (import.meta.env.VITE_CONVEX_URL as string).replace(
  "cloud",
  "site",
);

const proxiedWebSocketConstructor = createProxiedWebSocketClass(
  "https://sse-ws-proxy-production.up.railway.app",
);

(window as any).SSE_WS_VERBOSE = true;
(window as any).proxiedWebSocketConstructor = proxiedWebSocketConstructor;

function WebSocketTest() {
  const [convex] = useState(
    () =>
      new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string, {
        onServerDisconnectError: (err) => {
          console.log(
            "Normal ConvexReactClient client experienced server disconnect error:",
            err,
          );
        },
      }),
  );

  return (
    <ConvexProvider client={convex}>
      <WebSocketTestInner />
    </ConvexProvider>
  );
}

function useNonreactiveConnectionStatus() {
  const convex = useConvex();
  const [status, setStatus] = useState(convex.connectionState());
  const lastStatusRef = useRef(status);

  useEffect(() => {
    const timer = setInterval(() => {
      const curStatus = convex.connectionState();
      if (JSON.stringify(curStatus) !== JSON.stringify(lastStatusRef.current)) {
        lastStatusRef.current = curStatus;
        setStatus(curStatus);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
    };
  }, [convex]);

  return status;
}

function WebSocketTestInner() {
  const manualStatus = useNonreactiveConnectionStatus();
  const reactiveStatus = useConvexConnectionState();
  const mut = useMutation(api.myFunctions.addNumber);
  useQuery(api.myFunctions.listNumbers, { count: 1 });
  const status = reactiveStatus;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <details>
        <summary className="flex items-center cursor-pointer py-1">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${status.isWebSocketConnected ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <h3 className="text-lg font-semibold">WebSocket Test</h3>
          <span className="ml-2 text-sm text-gray-500">
            {status.isWebSocketConnected ? "Connected" : "Disconnected"}
          </span>
        </summary>

        <div className="mt-4 pl-5">
          <div className="text-gray-700 mb-2">
            Status:{" "}
            {status.isWebSocketConnected ? (
              <span className="text-green-600 font-medium">Connected</span>
            ) : (
              <span className="text-red-600 font-medium">Disconnected</span>
            )}
          </div>

          <div className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-auto max-h-120">
            <div className="font-semibold mb-1">
              Reactive Connection details:
            </div>
            <pre>{JSON.stringify(status, null, 2)}</pre>
            <div className="font-semibold mb-1">
              Nonreactive Connection details:
            </div>
            <pre>{JSON.stringify(manualStatus, null, 2)}</pre>
          </div>
        </div>
        <button
          className="px-2 py-1 mx-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
          onClick={() => void mut({ value: Math.random() })}
        >
          run mutation
        </button>
      </details>
    </div>
  );
}

function HttpTest() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(`${SITE_URL}/ping`);
      const data = await response.json();
      setResponse(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      setStatus("error");
    }
  };

  // Auto-run test on component mount
  useEffect(() => {
    void runTest();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <details>
        <summary className="flex items-center cursor-pointer py-1">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              status === "success"
                ? "bg-green-500"
                : status === "error"
                  ? "bg-red-500"
                  : status === "loading"
                    ? "bg-yellow-500"
                    : "bg-gray-300"
            }`}
          ></div>
          <h3 className="text-lg font-semibold">HTTP Test</h3>
          <span className="ml-2 text-sm text-gray-500">
            {status === "loading"
              ? "Testing..."
              : status === "success"
                ? "Completed"
                : status === "error"
                  ? "Failed"
                  : "Idle"}
          </span>
        </summary>

        <div className="mt-4 pl-5">
          <div className="mb-4">
            <button
              onClick={() => void runTest()}
              disabled={status === "loading"}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
            >
              {status === "loading" ? "Testing..." : "Run Test Again"}
            </button>
          </div>

          {status === "success" && (
            <div className="text-green-600">
              HTTP connection successful!
              <div className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-auto max-h-120">
                <pre>{JSON.stringify(response, null, 2)}</pre>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-red-600">HTTP connection failed: {error}</div>
          )}
        </div>
      </details>
    </div>
  );
}

function SSETest() {
  const [status, setStatus] = useState<
    "idle" | "connecting" | "connected" | "completed" | "error"
  >("idle");
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runTest = () => {
    setStatus("connecting");
    setMessages([]);
    setError(null);

    try {
      const eventSource = new EventSource(`${SITE_URL}/sse`);
      let messageCount = 0;
      let successfulConnection = false;

      eventSource.onopen = () => {
        setStatus("connected");
        successfulConnection = true;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages((prev) => [...prev, data]);
          messageCount++;

          // Check for completion message
          if (data.type === "complete") {
            // Gracefully close the connection after receiving completion message
            eventSource.close();
            setStatus("completed");
            return;
          }
        } catch {
          setMessages((prev) => [...prev, event.data]);
          if (event.data === "Connected to SSE") {
            successfulConnection = true;
          }
        }
      };

      eventSource.onerror = (_err) => {
        // Only treat as an error if we haven't established a connection
        // or haven't received the expected number of messages
        if (!successfulConnection) {
          setError("Failed to establish SSE connection");
          setStatus("error");
        } else if (messageCount > 0 && messageCount < 10) {
          setError("SSE connection closed unexpectedly");
          setStatus("error");
        } else {
          // Normal closure after receiving all messages
          setStatus("completed");
        }
        eventSource.close();
      };

      // Safety timeout to ensure we always close the connection
      setTimeout(() => {
        eventSource.close();
        if (status === "connected") {
          setStatus("completed");
        }
      }, 15000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      setStatus("error");
    }
  };

  // Auto-run test on component mount
  useEffect(() => {
    runTest();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <details>
        <summary className="flex items-center cursor-pointer py-1">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              status === "connected" || status === "completed"
                ? "bg-green-500"
                : status === "error"
                  ? "bg-red-500"
                  : status === "connecting"
                    ? "bg-yellow-500"
                    : "bg-gray-300"
            }`}
          ></div>
          <h3 className="text-lg font-semibold">
            Server-Sent Events (SSE) Test
          </h3>
          <span className="ml-2 text-sm text-gray-500">
            {status === "connecting"
              ? "Connecting..."
              : status === "connected"
                ? "Connected"
                : status === "completed"
                  ? "Completed"
                  : status === "error"
                    ? "Failed"
                    : "Idle"}
          </span>
        </summary>

        <div className="mt-4 pl-5">
          <div className="mb-4">
            <button
              onClick={runTest}
              disabled={status === "connecting" || status === "connected"}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
            >
              {status === "connecting"
                ? "Connecting..."
                : status === "connected"
                  ? "Connected"
                  : "Run Test Again"}
            </button>
          </div>

          {(status === "connected" || status === "completed") &&
            messages.length > 0 && (
              <div className="text-green-600">
                {status === "completed"
                  ? "SSE test completed successfully!"
                  : "SSE connection successful!"}
                <div className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-auto max-h-120">
                  <div className="font-semibold mb-1">Received messages:</div>
                  <pre>{JSON.stringify(messages, null, 2)}</pre>
                </div>
              </div>
            )}

          {status === "error" && (
            <div className="text-red-600">SSE connection failed: {error}</div>
          )}
        </div>
      </details>
    </div>
  );
}

function ProxiedWebSocket() {
  const [proxiedConvex] = useState(
    () =>
      new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string, {
        webSocketConstructor: proxiedWebSocketConstructor,

        onServerDisconnectError: (err) => {
          console.log(
            "Proxied Convex client experienced server disconnect error:",
            err,
          );
        },
      }),
  );
  (window as any).proxiedConvex = proxiedConvex;

  return (
    <ConvexProvider client={proxiedConvex}>
      <ProxiedWebSockInner />
    </ConvexProvider>
  );
}

function ProxiedWebSockInner() {
  const manualStatus = useNonreactiveConnectionStatus();
  const reactiveStatus = useConvexConnectionState();
  const mut = useMutation(api.myFunctions.addNumber);
  useQuery(api.myFunctions.listNumbers, { count: 1 });
  const status = reactiveStatus;

  if (status === undefined) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        Checking fourth connection type...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <details>
        <summary className="flex items-center cursor-pointer py-1">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${status.isWebSocketConnected ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <h3 className="text-lg font-semibold">Proxied WebSocket Test</h3>
          <span className="ml-2 text-sm text-gray-500">
            {status.isWebSocketConnected ? "Connected" : "Disconnected"}
          </span>
        </summary>

        <div className="mt-4 pl-5">
          <div className="text-gray-700 mb-2">
            Status:{" "}
            {status.isWebSocketConnected ? (
              <span className="text-green-600 font-medium">Connected</span>
            ) : (
              <span className="text-red-600 font-medium">Disconnected</span>
            )}
          </div>

          <div className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-auto max-h-120">
            <div className="font-semibold mb-1">
              Reactive Connection details:
            </div>
            <pre>{JSON.stringify(status, null, 2)}</pre>
            <div className="font-semibold mb-1">
              Nonreactive Connection details:
            </div>
            <pre>{JSON.stringify(manualStatus, null, 2)}</pre>
          </div>
        </div>
        <button
          className="px-2 py-1 mx-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
          onClick={() => void mut({ value: Math.random() })}
        >
          run mutation
        </button>
      </details>
    </div>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-indigo-700">
        Connection Tests
      </h2>
      <p className="text-gray-600 text-sm mb-2">
        Run each test to verify connectivity using different protocols.
      </p>
      <WebSocketTest />
      <HttpTest />
      <SSETest />
      <ProxiedWebSocket />
    </div>
  );
}
