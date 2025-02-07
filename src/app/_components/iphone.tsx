"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const NOTIFICATIONS = [
  {
    title: "SSpot - Jauns dzīvoklis!",
    message: "3-ist. dzīvoklis Purvciemā, 85m², 129000€",
  },
  {
    title: "SSpot - Jauns dzīvoklis!",
    message: "2-ist. dzīvoklis Centrā, 55m², 95000€",
  },
  {
    title: "SSpot - Jauns dzīvoklis!",
    message: "4-ist. dzīvoklis Imantā, 95m², 145000€",
  },
];

function Notification({
  title,
  message,
  onHide,
}: {
  title: string;
  message: string;
  onHide: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onHide, 3000);
    return () => clearTimeout(timer);
  }, [onHide]);

  return (
    <motion.div
      initial={{ y: -100, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      exit={{ y: 20, x: "-50%", opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 1,
      }}
      className="absolute top-10 left-1/2 w-[90%]"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[rgba(40,40,40,0.85)] backdrop-blur-xl rounded-2xl p-4 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [1, 0.9, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-focus flex-shrink-0 flex items-center justify-center text-white font-bold"
          >
            S
          </motion.div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[15px] text-white leading-tight">
              {title}
            </h4>
            <p className="text-[13px] text-zinc-200 mt-0.5 leading-tight">
              {message}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function IPhone() {
  const [notificationIndex, setNotificationIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    let index = 0;
    const showNextNotification = () => {
      setNotificationIndex(null); // First set to null to trigger exit animation
      setTimeout(() => {
        setNotificationIndex(index);
        index = (index + 1) % NOTIFICATIONS.length;
      }, 500); // Reduced from 500ms to 200ms for quicker transitions
    };

    // Show first notification after a delay
    const initialTimer = setTimeout(() => {
      setNotificationIndex(0);
      index = 1;
    }, 500); // Reduced from 1000ms to 500ms for quicker initial start

    // Set up interval for subsequent notifications
    const interval = setInterval(showNextNotification, 4000); // Reduced from 6000ms to 4000ms for faster cycling

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative">
      <div className="mask-image-gradient">
        <div className="relative w-64 sm:w-72 md:w-80 lg:w-96 aspect-[1/2] rounded-[45px] shadow-[0_0_2px_2px_rgba(255,255,255,0.1)] border-8 border-zinc-900 ml-1 overflow-hidden">
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[90px] h-[22px] bg-black rounded-full z-20"></div>

          <div className="absolute -inset-[1px] border-[3px] border-zinc-700 border-opacity-40 rounded-[37px] pointer-events-none"></div>

          {/* Screen Content */}
          <div className="relative w-full h-full rounded-[37px] overflow-hidden bg-gradient-to-b from-zinc-200 via-zinc-50 to-white">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.3] mix-blend-overlay pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-black/10"></div>

            <AnimatePresence mode="wait">
              {notificationIndex !== null && (
                <Notification
                  key={notificationIndex}
                  {...NOTIFICATIONS[notificationIndex]}
                  onHide={() => setNotificationIndex(null)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Left Side Buttons */}
          <div className="absolute left-[-12px] top-[12%] w-[6px] h-8 bg-zinc-900 rounded-l-md shadow-md"></div>

          {/* Right Side Button (Power) */}
          <div className="absolute right-[-12px] top-[12%] w-[6px] h-8 bg-zinc-900 rounded-r-md shadow-md"></div>
        </div>
      </div>
    </div>
  );
}
