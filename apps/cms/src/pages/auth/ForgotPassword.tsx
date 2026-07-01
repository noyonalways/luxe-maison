import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import ForgotPasswordFlow from "@/components/auth/ForgotPasswordFlow";

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="bg-background rounded-lg border border-border p-8 shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield size={24} className="text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-semibold">MAISON</h1>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              Staff Portal
            </p>
          </div>
          <ForgotPasswordFlow
            variant="staff"
            onBack={() => navigate({ to: "/login" })}
          />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
