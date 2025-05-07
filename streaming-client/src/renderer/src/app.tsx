import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StreamingClient from "./components/streaming-client";

const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <StreamingClient />
    </QueryClientProvider>
  );
};

export default App;
