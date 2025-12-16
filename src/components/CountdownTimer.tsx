import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
}

export function CountdownTimer({ targetDate, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={`flex items-center justify-center gap-2 md:gap-4 ${className}`}>
      {timeLeft.days > 0 && (
        <>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 md:px-4 md:py-3 border-2 border-white/30">
            <div className="text-2xl md:text-4xl font-bold text-white">{timeLeft.days}</div>
            <div className="text-xs md:text-sm text-white/90">días</div>
          </div>
          <span className="text-white text-xl md:text-2xl font-bold">:</span>
        </>
      )}
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 md:px-4 md:py-3 border-2 border-white/30">
        <div className="text-2xl md:text-4xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="text-xs md:text-sm text-white/90">horas</div>
      </div>
      <span className="text-white text-xl md:text-2xl font-bold">:</span>
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 md:px-4 md:py-3 border-2 border-white/30">
        <div className="text-2xl md:text-4xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="text-xs md:text-sm text-white/90">min</div>
      </div>
      <span className="text-white text-xl md:text-2xl font-bold">:</span>
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 md:px-4 md:py-3 border-2 border-white/30">
        <div className="text-2xl md:text-4xl font-bold text-white animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="text-xs md:text-sm text-white/90">seg</div>
      </div>
    </div>
  );
}

