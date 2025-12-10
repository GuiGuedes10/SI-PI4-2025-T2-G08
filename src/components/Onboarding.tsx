import { useState } from 'react';
import { Shield, Zap, TrendingUp, Mail, Lock, User, GamepadIcon, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingProps {
  onNavigate: (screen: string) => void;
}

type OnboardingView = 'landing' | 'login' | 'register';

const features = [
  {
    icon: TrendingUp,
    label: 'Análises em tempo real',
    description: 'Receba insights detalhados assim que terminar cada partida.',
    color: 'var(--neon-primary)',
  },
  {
    icon: Zap,
    label: 'Builds otimizadas',
    description: 'Configure seus campeões para a vitória com builds baseadas em dados.',
    color: 'var(--neon-accent)',
  },
  {
    icon: Shield,
    label: 'Assistente pessoal',
    description: 'Dicas contextuais e alertas para evoluir seu gameplay.',
    color: 'var(--success)',
  },
];

export function Onboarding({ onNavigate }: OnboardingProps) {
  const [view, setView] = useState<OnboardingView>('landing');

  return (
    <div className="min-h-screen flex flex-col">
      {view === 'landing' && <LandingView onChangeView={setView} />}
      {view === 'login' && <LoginView onChangeView={setView} onNavigate={onNavigate} />}
      {view === 'register' && <RegisterView onChangeView={setView} onNavigate={onNavigate} />}
    </div>
  );
}

// ============================================
// LANDING VIEW
// ============================================

interface LandingViewProps {
  onChangeView: (view: OnboardingView) => void;
}

function LandingView({ onChangeView }: LandingViewProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Value Proposition */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 lg:py-20">
        <div className="max-w-xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 glass rounded-xl flex items-center justify-center text-xl font-bold"
              style={{ color: 'var(--neon-primary)' }}
            >
              SG
            </div>
            <span className="text-xl font-bold">SmartGG</span>
          </div>

          {/* Hero Text */}
          <div className="mb-12">
            <h1 className="mb-4 text-strong">
              DOMINE O JOGO COM INTELIGÊNCIA.
            </h1>
            <p className="text-xl text-muted">
              Análises em tempo real, builds otimizadas e assistente pessoal para evoluir seu gameplay
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6 mb-12">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.label} className="flex gap-4 items-start">
                  <div className="p-3 glass rounded-lg border" style={{ borderColor: feature.color }}>
                    <Icon className="w-6 h-6" style={{ color: feature.color }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="mb-1">{feature.label.toUpperCase()}</h4>
                    <p className="text-muted">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTAs */}
          <div className="space-y-4">
            <button
              onClick={() => onChangeView('login')}
              className="w-full h-12 px-6 glass rounded-xl transition-smooth hover:scale-[1.02] neon-glow-primary"
              style={{ borderColor: 'var(--neon-primary)', color: 'var(--neon-primary)' }}
            >
              Entrar
            </button>

            <button
              onClick={() => onChangeView('register')}
              className="w-full h-12 px-6 glass rounded-xl transition-smooth hover:scale-[1.02]"
              style={{ borderColor: 'var(--neon-accent)', color: 'var(--neon-accent)' }}
            >
              Criar conta
            </button>
          </div>

          <p className="mt-8 text-sm text-center text-muted">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
          </p>
        </div>
      </div>

      {/* Right side - Dashboard Preview */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-2xl glass rounded-2xl p-8 relative overflow-hidden">
          {/* Neon border effect */}
          <div
            className="absolute inset-0 rounded-2xl opacity-50"
            style={{
              background: `linear-gradient(135deg, var(--neon-primary) 0%, var(--neon-accent) 100%)`,
              padding: '2px',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />

          <div className="relative z-10">
            <h3 className="mb-6 text-center" style={{ color: 'var(--neon-primary)' }}>
              Prévia do Dashboard
            </h3>

            <div className="mb-6">
              <p className="text-sm mb-4" style={{ color: 'var(--muted-text)' }}>SEU DESEMPENHO EM FOCO</p>
              <div className="h-32 glass rounded-lg p-4 flex items-end gap-2">
                {[40, 60, 45, 70, 55, 80, 65, 75, 60, 85, 70, 90].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${height}%`,
                      background: i % 2 === 0 ? 'var(--neon-primary)' : 'var(--neon-accent)',
                      opacity: 0.7,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass rounded-lg p-4">
                <p className="text-sm mb-2" style={{ color: 'var(--muted-text)' }}>Winrate</p>
                <p className="text-2xl" style={{ color: 'var(--neon-primary)' }}>52.4%</p>
              </div>
              <div className="glass rounded-lg p-4">
                <p className="text-sm mb-2" style={{ color: 'var(--muted-text)' }}>KDA Ratio</p>
                <p className="text-2xl" style={{ color: 'var(--neon-accent)' }}>3.8</p>
              </div>
            </div>

            <div className="glass rounded-lg p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full glass flex items-center justify-center relative">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(var(--neon-primary) 70%, transparent 70%)`,
                    opacity: 0.3,
                  }}
                />
                <span className="relative z-10 text-2xl">?</span>
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted-text)' }}>Seu nome aqui</p>
                <p className="text-lg">Comece agora</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOGIN VIEW
// ============================================

interface AuthViewProps {
  onChangeView: (view: OnboardingView) => void;
  onNavigate: (screen: string) => void;
}

function LoginView({ onChangeView, onNavigate }: AuthViewProps) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    try {
      await login({ email, password });
      onNavigate('dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Email ou senha incorretos');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => onChangeView('landing')}
          className="flex items-center gap-2 mb-6 text-sm transition-smooth hover:opacity-80 text-muted"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{ color: 'var(--neon-primary)' }}
              >
                SG
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Bem-vindo de volta</h2>
            <p className="text-sm text-muted">
              Entre na sua conta para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full h-12 px-4 glass rounded-xl bg-transparent outline-none transition-smooth focus:ring-2 focus:ring-neon-primary/30 focus:border-neon-primary"
                style={{ color: 'var(--strong-text)' }}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 glass rounded-xl bg-transparent outline-none transition-smooth focus:ring-2 focus:ring-neon-primary/30 focus:border-neon-primary"
                  style={{ color: 'var(--strong-text)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl text-sm text-center bg-danger-10 text-danger">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 glass rounded-xl transition-smooth hover:scale-[1.02] neon-glow-primary disabled:opacity-50 border border-neon-primary text-neon-primary"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Entrando...</span>
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-muted">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-muted">
            Não tem uma conta?{' '}
            <button
              onClick={() => onChangeView('register')}
              className="font-semibold transition-smooth hover:opacity-80 text-neon-accent"
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// REGISTER VIEW
// ============================================

function RegisterView({ onChangeView, onNavigate }: AuthViewProps) {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    gameName: '',
    tagLine: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Preencha todos os campos');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Email inválido');
      return false;
    }
    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.gameName || !formData.tagLine) {
      setError('Preencha seu nome de invocador e tag');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        gameName: formData.gameName,
        tagLine: formData.tagLine.replace('#', ''),
      });
      onNavigate('dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => step === 1 ? onChangeView('landing') : setStep(1)}
          className="flex items-center gap-2 mb-6 text-sm transition-smooth hover:opacity-80"
          style={{ color: 'var(--muted-text)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 1 ? 'Voltar' : 'Voltar para credenciais'}</span>
        </button>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{ color: 'var(--neon-accent)' }}
              >
                SG
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {step === 1 ? 'Crie sua conta' : 'Conecte seu invocador'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
              {step === 1 ? 'Preencha seus dados para começar' : 'Informe seu nome de invocador do LoL'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: 'var(--neon-accent)' }} />
            <div
              className="w-10 h-1.5 rounded-full transition-smooth"
              style={{ backgroundColor: step === 2 ? 'var(--neon-accent)' : 'rgba(255,255,255,0.1)' }}
            />
          </div>

          {/* Form */}
          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit} className="space-y-5">

            {step === 1 ? (
              <>
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium" style={{ color: 'var(--muted-text)' }}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full h-12 px-4 glass rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-neon-accent/30"
                    style={{ color: 'var(--strong-text)' }}
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium" style={{ color: 'var(--muted-text)' }}>Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full h-12 px-4 pr-12 glass rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-neon-accent/30"
                      style={{ color: 'var(--strong-text)' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" style={{ color: 'var(--muted-text)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--muted-text)' }} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium" style={{ color: 'var(--muted-text)' }}>Confirmar senha</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full h-12 px-4 glass rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-neon-accent/30"
                    style={{ color: 'var(--strong-text)' }}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Game Name Field */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium" style={{ color: 'var(--muted-text)' }}>Nome de Invocador</label>
                  <input
                    type="text"
                    value={formData.gameName}
                    onChange={(e) => handleChange('gameName', e.target.value)}
                    placeholder="Seu nome no LoL"
                    className="w-full h-12 px-4 glass rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-neon-accent/30"
                    style={{ color: 'var(--strong-text)' }}
                  />
                </div>

                {/* Tag Line Field */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium" style={{ color: 'var(--muted-text)' }}>Tag (sem o #)</label>
                  <input
                    type="text"
                    value={formData.tagLine}
                    onChange={(e) => handleChange('tagLine', e.target.value.replace('#', ''))}
                    placeholder="BR1"
                    className="w-full h-12 px-4 glass rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-neon-accent/30"
                    style={{ color: 'var(--strong-text)' }}
                  />
                  <p className="mt-2 text-xs" style={{ color: 'var(--muted-text)' }}>
                    Exemplo: se seu nick é <strong>Player#BR1</strong>, digite <strong>Player</strong> acima e <strong>BR1</strong> aqui.
                  </p>
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl text-sm text-center" style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)', color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 glass rounded-xl transition-smooth hover:scale-[1.02] neon-glow-accent disabled:opacity-50"
              style={{ borderColor: 'var(--neon-accent)', color: 'var(--neon-accent)' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Criando conta...</span>
                </span>
              ) : step === 1 ? (
                'Próximo'
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs" style={{ color: 'var(--muted-text)' }}>ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm" style={{ color: 'var(--muted-text)' }}>
            Já tem uma conta?{' '}
            <button
              onClick={() => onChangeView('login')}
              className="font-semibold transition-smooth hover:opacity-80"
              style={{ color: 'var(--neon-primary)' }}
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
