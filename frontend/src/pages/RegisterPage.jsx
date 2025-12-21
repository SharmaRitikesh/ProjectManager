import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AbstractBackground from '../components/common/AbstractBackground';
import './AuthPages.css';

function RegisterPage() {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Get time-based greeting
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good Morning';
        if (hour >= 12 && hour < 17) return 'Good Afternoon';
        if (hour >= 17 && hour < 21) return 'Good Evening';
        return 'Good Night';
    }, []);

    // Password validation checks
    const passwordChecks = useMemo(() => {
        const password = formData.password;
        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
    }, [formData.password]);

    const isPasswordValid = Object.values(passwordChecks).every(Boolean);
    const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

    // Email validation
    const isEmailValid = useMemo(() => {
        const email = formData.email;
        if (!email) return true; // Don't show error when empty
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }, [formData.email]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isPasswordValid) {
            setError('Please meet all password requirements');
            return;
        }

        if (!isEmailValid) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await register(formData);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 2) return '#f87171';
        if (passwordStrength <= 3) return '#fbbf24';
        if (passwordStrength <= 4) return '#60a5fa';
        return '#34d399';
    };

    const getStrengthLabel = () => {
        if (passwordStrength <= 2) return 'Weak';
        if (passwordStrength <= 3) return 'Medium';
        if (passwordStrength <= 4) return 'Strong';
        return 'Very Strong';
    };

    return (
        <div className="auth-page">
            <AbstractBackground />
            <div className="auth-container animate-fade-in">
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="logo-icon">PM</div>
                    </div>
                    <h1>Welcome!</h1>
                    <p>{greeting}! Get started with Project Manager</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            className="form-input"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="form-input"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className={`form-input ${formData.email && !isEmailValid ? 'input-error' : ''}`}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        {formData.email && !isEmailValid && (
                            <div className="form-error">Please enter a valid email address</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {formData.password && (
                            <>
                                {/* Password Strength Bar */}
                                <div style={{ marginTop: '0.75rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.25rem',
                                        fontSize: '0.75rem'
                                    }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Strength</span>
                                        <span style={{ color: getStrengthColor(), fontWeight: 500 }}>
                                            {getStrengthLabel()}
                                        </span>
                                    </div>
                                    <div style={{
                                        height: '4px',
                                        background: 'var(--bg-glass)',
                                        borderRadius: '2px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(passwordStrength / 5) * 100}%`,
                                            background: getStrengthColor(),
                                            transition: 'all 0.3s ease'
                                        }} />
                                    </div>
                                </div>

                                {/* Password Requirements */}
                                <div style={{
                                    marginTop: '0.75rem',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '0.25rem',
                                    fontSize: '0.7rem'
                                }}>
                                    <div style={{ color: passwordChecks.length ? '#34d399' : 'var(--text-muted)' }}>
                                        {passwordChecks.length ? '✓' : '○'} 8+ characters
                                    </div>
                                    <div style={{ color: passwordChecks.uppercase ? '#34d399' : 'var(--text-muted)' }}>
                                        {passwordChecks.uppercase ? '✓' : '○'} Uppercase
                                    </div>
                                    <div style={{ color: passwordChecks.lowercase ? '#34d399' : 'var(--text-muted)' }}>
                                        {passwordChecks.lowercase ? '✓' : '○'} Lowercase
                                    </div>
                                    <div style={{ color: passwordChecks.number ? '#34d399' : 'var(--text-muted)' }}>
                                        {passwordChecks.number ? '✓' : '○'} Number
                                    </div>
                                    <div style={{ color: passwordChecks.special ? '#34d399' : 'var(--text-muted)', gridColumn: 'span 2' }}>
                                        {passwordChecks.special ? '✓' : '○'} Special character (!@#$%^&*)
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={loading || !isPasswordValid || !isEmailValid}
                    >
                        {loading ? <span className="spinner"></span> : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
