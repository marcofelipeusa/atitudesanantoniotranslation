import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import churchLogo from "@/assets/church-logo.png";

const Login = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    // Generate mock JWT token
    const mockToken = btoa(JSON.stringify({
      username: "atitude",
      exp: Date.now() + 3600000, // 1 hour
    }));
    
    localStorage.setItem("jwt_token", mockToken);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl flex flex-col items-center gap-12"
      >
        <motion.img
          src={churchLogo}
          alt="Igreja Baptista Atitude"
          className="w-full max-w-lg h-auto"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button
            onClick={handleStart}
            size="lg"
            className="text-lg px-12 py-6 h-auto font-semibold"
          >
            Let's Translate
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
