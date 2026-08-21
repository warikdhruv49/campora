import {
  Users, GraduationCap, Briefcase, Clock, Laptop, TrendingUp, Undo2, Gift,
  CircleDollarSign, Utensils, School, BookOpen, Library, BedDouble, Home, Bus,
  Fuel, ShoppingBag, Clapperboard, Gamepad2, Repeat, Smartphone, Wifi,
  HeartPulse, Plane, Receipt, Tag,
} from 'lucide-react';

const ICONS = {
  Users, GraduationCap, Briefcase, Clock, Laptop, TrendingUp, Undo2, Gift,
  CircleDollarSign, Utensils, School, BookOpen, Library, BedDouble, Home, Bus,
  Fuel, ShoppingBag, Clapperboard, Gamepad2, Repeat, Smartphone, Wifi,
  HeartPulse, Plane, Receipt,
};

export default function CategoryIcon({ icon, color = '#8b95a5', size = 16, className }) {
  const IconComponent = ICONS[icon] || Tag;
  return <IconComponent size={size} strokeWidth={1.8} style={{ color }} className={className} />;
}
