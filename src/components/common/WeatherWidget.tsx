import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer } from 'lucide-react';
import Card from './Card';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 75,
    windSpeed: 12
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-primary-500/10 to-primary-500/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-dark-300">
            {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
          </p>
          <div className="flex items-center mt-2">
            <Thermometer size={18} className="text-primary-500 mr-2" />
            <span className="text-2xl font-bold text-white">
              {weather.temperature}°C
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end mb-2">
            <Cloud size={24} className="text-primary-500 mr-2" />
            <span className="text-dark-200">{weather.condition}</span>
          </div>
          <div className="flex items-center text-sm text-dark-300">
            <Wind size={14} className="mr-1" />
            <span>{weather.windSpeed} km/h</span>
            <span className="mx-2">|</span>
            <CloudRain size={14} className="mr-1" />
            <span>{weather.humidity}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherWidget;