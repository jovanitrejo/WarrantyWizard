import { useState } from 'react';
import './Settings.css';

export default function Settings() {
  const [alertDays, setAlertDays] = useState(30);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [teamMembers, setTeamMembers] = useState<string[]>(['admin@example.com']);
  const [newMember, setNewMember] = useState('');

  const handleAddMember = () => {
    if (newMember.trim() && !teamMembers.includes(newMember.trim())) {
      setTeamMembers([...teamMembers, newMember.trim()]);
      setNewMember('');
    }
  };

  const handleRemoveMember = (member: string) => {
    setTeamMembers(teamMembers.filter(m => m !== member));
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your WarrantyWizard preferences</p>
      </div>

      <div className="settings-content">
        {/* Alerts Settings */}
        <div className="settings-section">
          <h2>Alert Settings</h2>
          <div className="settings-group">
            <label>
              <span>Alert Days Before Expiration</span>
              <input
                type="number"
                value={alertDays}
                onChange={(e) => setAlertDays(parseInt(e.target.value) || 30)}
                min="1"
                max="365"
              />
              <span className="hint">Get notified this many days before warranty expires</span>
            </label>
          </div>
          <div className="settings-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
              <span>Enable Email Alerts</span>
            </label>
          </div>
          <button className="btn btn-primary">Save Alert Settings</button>
        </div>

        {/* Team Management */}
        <div className="settings-section">
          <h2>Team Management</h2>
          <div className="team-list">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="team-member">
                <span>{member}</span>
                <button
                  onClick={() => handleRemoveMember(member)}
                  className="btn-remove"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="add-member">
            <input
              type="email"
              placeholder="Enter email address"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
            />
            <button onClick={handleAddMember} className="btn btn-secondary">
              Add Member
            </button>
          </div>
        </div>

        {/* General Settings */}
        <div className="settings-section">
          <h2>General Settings</h2>
          <div className="settings-group">
            <label>
              <span>Default Currency</span>
              <select defaultValue="USD">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </label>
          </div>
          <div className="settings-group">
            <label>
              <span>Date Format</span>
              <select defaultValue="MM/DD/YYYY">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </label>
          </div>
          <button className="btn btn-primary">Save General Settings</button>
        </div>
      </div>
    </div>
  );
}

