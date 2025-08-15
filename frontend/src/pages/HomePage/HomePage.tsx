import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, BarChart3, Download, Users } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: "Conversational AI Guidance",
      description: "Transform your ideas through intelligent conversation with multiple AI perspectives",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: BarChart3,
      title: "Live Visual Intelligence",
      description: "Watch market analysis and competitive insights build in real-time as you chat",
      color: "text-green-600 bg-green-100"
    },
    {
      icon: Download,
      title: "Portable Context Export",
      description: "Export complete project specifications ready for any development platform",
      color: "text-purple-600 bg-purple-100"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Solo Founder",
      content: "DevbrainAI helped me validate my SaaS idea and get to MVP in just 6 weeks. The visual insights were game-changing.",
      avatar: "SC"
    },
    {
      name: "Mike Rodriguez",
      role: "Developer",
      content: "The context export feature is incredible. I had complete specifications and could start building immediately.",
      avatar: "MR"
    },
    {
      name: "Jessica Kim",
      role: "Startup CTO",
      content: "Our team's productivity increased 3x with DevbrainAI's collaborative features and real-time tracking.",
      avatar: "JK"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">DevbrainAI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
              About
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/auth/login')}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/auth/signup')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Badge variant="info" className="mb-6">
            🚀 Now with Multi-AI Perspectives
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Ideas into
            <span className="text-primary-600"> MVPs with AI</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            DevbrainAI is your AI business consultant that turns concepts into deployed products through 
            intelligent conversation, live visual mapping, and portable development context.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => navigate('/app/projects/new')}
            >
              Start Building Your MVP Today
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                // Play demo video or show demo
                console.log('Show demo');
              }}
            >
              Watch 2-min Demo
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Trusted by 2,500+ founders</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⭐</span>
              <span>4.8/5 from 1,200+ reviews</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Demo Section */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl border p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                See DevbrainAI in Action
              </h2>
              <p className="text-gray-600">
                Watch how AI transforms a simple idea into a complete business plan with visuals
              </p>
            </div>
            
            {/* Demo Chat Interface Preview */}
            <div className="bg-gray-50 rounded-xl p-6 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs">👤</span>
                  </div>
                  <div className="bg-primary-600 text-white px-4 py-2 rounded-2xl rounded-bl-md max-w-xs">
                    An app for freelancers to manage invoices
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">🤖</span>
                  </div>
                  <div className="bg-white border px-4 py-2 rounded-2xl rounded-bl-md max-w-md">
                    <p className="text-sm mb-2">
                      Interesting! Let me start mapping this opportunity...
                    </p>
                    <div className="bg-gray-100 rounded-lg p-3 text-xs">
                      <div className="font-semibold mb-1">💰 Freelancer Software Market</div>
                      <div className="text-gray-600">$2.4B total addressable market</div>
                      <div className="text-gray-600">● Invoicing segment: $450M</div>
                      <div className="text-gray-600">📈 12% annual growth</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Everything You Need to Go From Idea to MVP
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform guides you through every step of product development
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-lg border hover:shadow-xl transition-shadow"
            >
              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-6", feature.color)}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Loved by Founders and Developers
            </h2>
            <p className="text-xl text-gray-600">
              See what our community says about DevbrainAI
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-lg"
              >
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Idea?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of founders who've successfully launched their MVPs with DevbrainAI
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => navigate('/app/projects/new')}
            >
              Start Your Free MVI Today
            </Button>
            <div className="text-sm text-gray-600">
              No credit card required • Free forever plan available
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="text-xl font-bold">DevbrainAI</span>
              </div>
              <p className="text-gray-400">
                AI-powered business consultant for modern founders and developers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Context Library</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DevbrainAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;