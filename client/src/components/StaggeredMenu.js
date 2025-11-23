import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import '../styles/StaggeredMenu.css';

const StaggeredMenu = ({
  position = 'right',
  items = [],
  socialItems = [],
  displaySocials = false,
  displayItemNumbering = false,
  menuButtonColor = '#fff',
  openMenuButtonColor = '#fff',
  changeMenuColorOnOpen = true,
  colors = ['#B8241C', '#e7615a'],
  logoUrl,
  accentColor = '#B8241C',
  onMenuOpen,
  onMenuClose
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState && onMenuOpen) {
      onMenuOpen();
    } else if (!newState && onMenuClose) {
      onMenuClose();
    }
  };

  const handleItemClick = () => {
    setIsOpen(false);
    if (onMenuClose) {
      onMenuClose();
    }
  };

  const menuVariants = {
    closed: {
      x: position === 'right' ? '100%' : '-100%',
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        delayChildren: 0.1
      }
    },
    open: {
      x: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: {
      opacity: 0,
      x: position === 'right' ? 50 : -50
    },
    open: {
      opacity: 1,
      x: 0
    }
  };

  const buttonColor = changeMenuColorOnOpen && isOpen ? openMenuButtonColor : menuButtonColor;
  const menuBgColor = isOpen ? colors[0] : 'transparent';

  return (
    <>
      {/* Menu Button */}
      <motion.button
        className={`staggered-menu-button ${position}`}
        onClick={toggleMenu}
        style={{ color: buttonColor }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <motion.span
          animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'block', width: '30px', height: '2px', background: buttonColor, marginBottom: '6px' }}
        />
        <motion.span
          animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'block', width: '30px', height: '2px', background: buttonColor, marginBottom: '6px' }}
        />
        <motion.span
          animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'block', width: '30px', height: '2px', background: buttonColor }}
        />
      </motion.button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Background Overlay */}
            <motion.div
              className="staggered-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
            />

            {/* Menu Panel */}
            <motion.div
              className={`staggered-menu-panel ${position}`}
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              style={{ background: menuBgColor }}
            >
              {/* Logo */}
              {logoUrl && (
                <motion.div
                  className="staggered-menu-logo"
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                >
                  <img src={logoUrl} alt="Logo" />
                </motion.div>
              )}

              {/* Menu Items */}
              <nav className="staggered-menu-items">
                {items.map((item, index) => (
                  <motion.div
                    key={item.link || index}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    style={{ '--delay': `${index * 0.1}s` }}
                  >
                    {item.onClick ? (
                      <button
                        className="staggered-menu-item"
                        aria-label={item.ariaLabel || item.label}
                        onClick={(e) => {
                          e.preventDefault();
                          handleItemClick();
                          if (item.onClick) {
                            item.onClick();
                          }
                        }}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          width: '100%',
                          fontFamily: 'inherit'
                        }}
                      >
                        {displayItemNumbering && (
                          <span className="menu-item-number">{(index + 1).toString().padStart(2, '0')}</span>
                        )}
                        <span>{item.label}</span>
                      </button>
                    ) : item.link && item.link.startsWith('http') ? (
                      <a
                        href={item.link}
                        className="staggered-menu-item"
                        aria-label={item.ariaLabel || item.label}
                        onClick={handleItemClick}
                      >
                        {displayItemNumbering && (
                          <span className="menu-item-number">{(index + 1).toString().padStart(2, '0')}</span>
                        )}
                        <span>{item.label}</span>
                      </a>
                    ) : (
                      <Link
                        to={item.link || '#'}
                        className="staggered-menu-item"
                        aria-label={item.ariaLabel || item.label}
                        onClick={handleItemClick}
                      >
                        {displayItemNumbering && (
                          <span className="menu-item-number">{(index + 1).toString().padStart(2, '0')}</span>
                        )}
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* Social Items */}
              {displaySocials && socialItems.length > 0 && (
                <motion.div
                  className="staggered-menu-socials"
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                >
                  {socialItems.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="staggered-menu-social"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={social.label}
                    >
                      {social.label}
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default StaggeredMenu;

