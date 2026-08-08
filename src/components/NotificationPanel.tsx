import { X, Bell, Trophy, Swords, Award } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import type { AppNotification } from '../types/dashboard';

const iconMap: Record<AppNotification['type'], typeof Bell> = {
  streak: Award,
  duel: Swords,
  leaderboard: Trophy,
};

export default function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notifications, markNotificationRead, clearNotifications } = useDashboard();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={onClose} />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[90vw] bg-dark-surface border-l border-border transform transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-sm font-bold text-foreground">NOTIFICATIONS</h2>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-dark-hover text-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted text-sm">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = iconMap[n.type];
              return (
                <button
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`w-full text-left p-4 border-b border-border hover:bg-dark-hover transition-colors cursor-pointer ${
                    !n.read ? 'bg-dark-elevated/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 ${
                      n.type === 'streak' ? 'text-gold' :
                      n.type === 'duel' ? 'text-destructive' : 'text-primary'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted mt-0.5">{n.body}</p>
                      <p className="text-2xs text-muted-lighter mt-1">
                        {new Date(n.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}