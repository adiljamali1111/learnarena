import { DashboardProvider } from './context/DashboardContext';
import AppShell from './components/AppShell';

export default function App() {
  return (
    <DashboardProvider>
      <AppShell />
    </DashboardProvider>
  );
}