"use client";

import { useEffect, useState, useCallback } from "react";
import useSWR from "swr";
import { fetcher, apiPostEmpty } from "@/app/fetcher";

interface Notification {
  id: number;
  notification_type: string;
  type_display: string;
  title: string;
  message: string;
  appointment_id: number | null;
  is_read: boolean;
  time_ago: string;
  created_at: string;
}

interface PendingTaskProps {
  maxHeight?: string;
}

const getNotificationStyle = (type: string) => {
  switch (type) {
    case "new_appointment":
      return {
        icon: "calendar_add_on",
        color: "bg-blue-500/20 text-blue-600",
      };
    case "appointment_cancelled":
      return {
        icon: "event_busy",
        color: "bg-red-500/20 text-red-500",
      };
    case "appointment_confirmed":
      return {
        icon: "event_available",
        color: "bg-green-500/20 text-green-500",
      };
    case "appointment_reminder":
      return {
        icon: "notifications_active",
        color: "bg-amber-500/20 text-amber-500",
      };
    default:
      return {
        icon: "notifications",
        color: "bg-gray-500/20 text-gray-500",
      };
  }
};

export default function PendingTask({ maxHeight = "400px" }: PendingTaskProps) {
  // Fetch notifications
  const {
    data: notifications,
    error,
    isLoading,
    mutate,
  } = useSWR<Notification[]>("/api/notifications/unread/", fetcher, {
    refreshInterval: 30000, // Polling cada 30 segundos
    revalidateOnFocus: true,
  });

  // Fetch unread count
  const { data: countData, mutate: mutateCount } = useSWR<{ count: number }>(
    "/api/notifications/unread-count/",
    fetcher,
    {
      refreshInterval: 30000,
    }
  );

  const unreadCount = countData?.count || 0;

  // Mark single notification as read
  const handleMarkAsRead = useCallback(
    async (notificationId: number) => {
      try {
        await apiPostEmpty(`/api/notifications/${notificationId}/mark-read/`);
        mutate();
        mutateCount();
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    },
    [mutate, mutateCount]
  );

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await apiPostEmpty("/api/notifications/mark-all-read/");
      mutate();
      mutateCount();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, [mutate, mutateCount]);

  return (
    <div className="bg-card-light p-6 rounded-xl shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em]">
            Notificaciones
          </h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        {notifications && notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Marcar todo como leído
          </button>
        )}
      </div>

      {/* Notifications List with Scroll */}
      <div
        className="space-y-3 overflow-y-auto pr-2 custom-scrollbar"
        style={{ maxHeight }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2">
              error
            </span>
            <p className="text-sm">Error al cargar notificaciones</p>
            <button
              onClick={() => mutate()}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              Reintentar
            </button>
          </div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification) => {
            const style = getNotificationStyle(notification.notification_type);
            return (
              <div
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                className={`flex items-start gap-3 p-3 rounded-lg bg-background-light dark:bg-background-dark transition-all cursor-pointer hover:shadow-md ${
                  !notification.is_read ? "border-l-4 border-blue-500" : ""
                }`}
              >
                <div
                  className={`${style.color} p-2 rounded-full flex-shrink-0`}
                >
                  <span className="material-symbols-outlined text-base">
                    {style.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.time_ago}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-2">
              notifications_off
            </span>
            <p className="text-sm">No tienes notificaciones</p>
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
