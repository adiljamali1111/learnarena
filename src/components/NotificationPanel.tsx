import { useEffect, useState } from 'react';
import { Bell, X, Trophy, Sparkles, Info, AlertCircle } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import type { Notification } from '../types/dashboard';

export default function NotificationPanel() {
  const { state, clearNotifications, markNotificationRead } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-notification-panel]')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'xp':
        return <Trophy size={14} className="text-gold" />;
      case 'achievement':
        return <Sparkles size={14} className="text-accent" />;
      case 'info':
        return <Info size={14} className="text-info" />;
      case 'error':
        return <AlertCircle size={14} className="text-destructive" />;
    }
  };

  return (
    <div className="relative" data-notification-panel>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell size={18} className="text-muted" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto glass-card p-3 z-50 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-heading font-semibold">Notifications</h3>
            {state.notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {state.notifications.length === 0 ? (
            <p className="text-xs text-muted-lighter text-center py-6">
              No notifications yet
            </p>
          ) : (
            <div className="space-y-1.5">
              {state.notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    n.read ? 'opacity-50' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">{getIcon(n.type)}</span>
                  <p className="text-xs text-foreground flex-1 leading-relaxed">
                    {n.message}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationRead(n.id);
                    }}
                    className="text-muted-lighter hover:text-foreground shrink-0 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}