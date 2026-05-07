import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Landing />
    </QueryClientProvider>
  );
}
