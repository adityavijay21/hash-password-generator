import React, { useState, useCallback, useMemo } from "react";
import { FaClipboard } from "react-icons/fa";
import crypto from "crypto-js";
import "./PasswordGenerator.css";

const algorithms = {
  MD5: crypto.MD5,
  SHA1: crypto.SHA1,
  SHA256: crypto.SHA256,
  SHA512: crypto.SHA512,
};

const specialChars = "!@#$%^&*()_+{}[]|:;<>,.?~";

const PasswordGenerator = () => {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [settings, setSettings] = useState({
    length: 12,
    includeSpecial: false,
    includeNumbers: false,
    algorithm: "SHA256",
  });

  const generatePassword = useCallback(() => {
    const hash = algorithms[settings.algorithm](input);
    let generatedPassword = hash
      .toString(crypto.enc.Base64)
      .substr(0, settings.length);

    if (settings.includeSpecial) {
      generatedPassword = generatedPassword.replace(/[A-Za-z0-9]/g, (char) =>
        Math.random() > 0.3
          ? char
          : specialChars[Math.floor(Math.random() * specialChars.length)],
      );
    }

    if (settings.includeNumbers) {
      generatedPassword = generatedPassword.replace(/[A-Za-z]/g, (char) =>
        Math.random() > 0.3 ? char : Math.floor(Math.random() * 10),
      );
    }

    setPassword(generatedPassword);
  }, [input, settings]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(password).then(() => {
      alert("Password copied to clipboard!");
    });
  }, [password]);

  const getPasswordStrength = useMemo(() => {
    if (password.length < 8) return "Weak";
    if (password.length < 12) return "Moderate";
    return "Strong";
  }, [password]);

  const strengthColor = useMemo(() => {
    const colors = {
      Weak: "#ff4d4d",
      Moderate: "#ffa64d",
      Strong: "#4CAF50",
    };
    return colors[getPasswordStrength] || colors.Strong;
  }, [getPasswordStrength]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        generatePassword();
      }
    },
    [generatePassword],
  );

  const handleClickOutside = useCallback((event) => {
    if (
      event.target.className !== "password-generator" &&
      !event.target.closest(".password-generator")
    ) {
      setShowAdvanced(false);
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);

  const updateSettings = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="container">
      <PasswordGeneratorUI
        input={input}
        setInput={setInput}
        password={password}
        generatePassword={generatePassword}
        copyToClipboard={copyToClipboard}
        getPasswordStrength={getPasswordStrength}
        strengthColor={strengthColor}
        handleKeyDown={handleKeyDown}
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        settings={settings}
        updateSettings={updateSettings}
      />
    </div>
  );
};

const PasswordGeneratorUI = React.memo(
  ({
    input,
    setInput,
    password,
    generatePassword,
    copyToClipboard,
    getPasswordStrength,
    strengthColor,
    handleKeyDown,
    showAdvanced,
    setShowAdvanced,
    settings,
    updateSettings,
  }) => (
    <div className="password-generator">
      <h1>Password Generator</h1>
      <InputSection
        input={input}
        setInput={setInput}
        generatePassword={generatePassword}
        handleKeyDown={handleKeyDown}
      />
      {password && (
        <ResultSection
          password={password}
          copyToClipboard={copyToClipboard}
          getPasswordStrength={getPasswordStrength}
          strengthColor={strengthColor}
        />
      )}
      <AdvancedSettingsButton setShowAdvanced={setShowAdvanced} />
      {showAdvanced && (
        <AdvancedSettingsModal
          settings={settings}
          updateSettings={updateSettings}
          onClose={() => setShowAdvanced(false)}
        />
      )}
      <Footer />
    </div>
  ),
);

const InputSection = React.memo(
  ({ input, setInput, generatePassword, handleKeyDown }) => (
    <div className="input-group">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your input"
        onKeyDown={handleKeyDown}
      />
      <button onClick={generatePassword}>Generate</button>
    </div>
  ),
);

const ResultSection = React.memo(
  ({ password, copyToClipboard, getPasswordStrength, strengthColor }) => (
    <div className="result">
      <h2>Generated Password</h2>
      <div className="password-display">
        <p>{password}</p>
        <FaClipboard onClick={copyToClipboard} />
      </div>
      <StrengthMeter
        strength={getPasswordStrength}
        color={strengthColor}
        passwordLength={password.length}
      />
    </div>
  ),
);

const StrengthMeter = React.memo(({ strength, color, passwordLength }) => (
  <div className="strength-meter">
    <p>
      Strength: <span style={{ color }}>{strength}</span>
    </p>
    <div
      className="strength-bar"
      style={{
        width: `${passwordLength * 8}%`,
        backgroundColor: color,
      }}
    />
  </div>
));

const AdvancedSettingsButton = React.memo(({ setShowAdvanced }) => (
  <button className="advanced-btn" onClick={() => setShowAdvanced(true)}>
    Advanced Settings
  </button>
));

const AdvancedSettingsModal = React.memo(
  ({ settings, updateSettings, onClose }) => (
    <div className="modal">
      <div className="modal-content">
        <h3>Advanced Settings</h3>
        <SettingsForm settings={settings} updateSettings={updateSettings} />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  ),
);

const SettingsForm = React.memo(({ settings, updateSettings }) => (
  <>
    <label>
      Password Length:
      <input
        type="number"
        value={settings.length}
        onChange={(e) =>
          updateSettings("length", Math.max(1, parseInt(e.target.value)))
        }
        min="1"
      />
    </label>
    <label>
      <input
        type="checkbox"
        checked={settings.includeSpecial}
        onChange={(e) => updateSettings("includeSpecial", e.target.checked)}
      />
      Include Special Characters
    </label>
    <label>
      <input
        type="checkbox"
        checked={settings.includeNumbers}
        onChange={(e) => updateSettings("includeNumbers", e.target.checked)}
      />
      Include Numbers
    </label>
    <label>
      Hash Algorithm:
      <select
        value={settings.algorithm}
        onChange={(e) => updateSettings("algorithm", e.target.value)}
      >
        {Object.keys(algorithms).map((algo) => (
          <option key={algo} value={algo}>
            {algo}
          </option>
        ))}
      </select>
    </label>
  </>
));

const Footer = React.memo(() => (
  <footer>
    <p>
      &copy; {new Date().getFullYear()} Hash Password Generator. Made with ❤️ by
      Aditya Vijay.
    </p>
    <p>All rights reserved.</p>
  </footer>
));

export default PasswordGenerator;
