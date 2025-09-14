import { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../stores/authStore';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (_) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Polls', href: '/polls' },
  ];

  const authenticatedNavigation = [
    ...navigation,
    { name: 'My Polls', href: '/my-polls' },
    { name: 'Create Poll', href: '/create-poll' },
  ];

  const activeNav = isAuthenticated ? authenticatedNavigation : navigation;

  return (
    <Disclosure as="nav" className="navbar">
      {({ open }) => (
        <>
          <div className="container inner">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="nav-brand">
                <Link to="/" style={{ textDecoration: 'none' }}>PollApp</Link>
              </div>
              <div className="nav-links">
                {activeNav.map((item) => (
                  <Link key={item.name} to={item.href} className="nav-link">
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="nav-actions">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="btn btn-ghost">Log in</Link>
                  <Link to="/register" className="btn btn-primary">Register</Link>
                </>
              ) : (
                <Menu as="div" className="dropdown">
                  <Menu.Button className="avatar" title={user?.name}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="dropdown-menu">
                      <div className="dropdown-header">
                        <div style={{ fontWeight: 700 }}>{user?.name}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{user?.email}</div>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link to="/my-polls" className="dropdown-item">
                            My Polls
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button onClick={handleLogout} className="dropdown-item">
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}

              <Disclosure.Button className="menu-toggle mobile-toggle">
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XMarkIcon className="icon-24" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="icon-24" aria-hidden="true" />
                )}
              </Disclosure.Button>
            </div>
          </div>

          <Disclosure.Panel className="mobile-menu">
            {activeNav.map((item) => (
              <Disclosure.Button key={item.name} as={Link} to={item.href} className="mobile-link">
                {item.name}
              </Disclosure.Button>
            ))}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}