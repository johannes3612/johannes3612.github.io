
import React, { useState, useEffect, useCallback } from 'react';
import { User, FamilyMember, FamilyData, AppTab } from './types';
import { DEFAULT_USER_USERNAME, DEFAULT_USER_PASSWORD, LocalStorageKeys } from './constants';
import * as storageService from './services/storageService';
import AuthForm from './components/AuthForm';
import Tabs from './components/Tabs';
import FamilyMemberForm from './components/FamilyMemberForm';
import ViewAllMembers from './components/ViewAllMembers';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [familyData, setFamilyData] = useState<FamilyData>({});
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.ViewAll);
  const [authError, setAuthError] = useState<string | null>(null);
  const [appMessage, setAppMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  const [memberToEditInForm, setMemberToEditInForm] = useState<FamilyMember | null>(null);
  const [editMemberIdInput, setEditMemberIdInput] = useState<string>('');


  // Initialize: load data, create default user if none exist
  useEffect(() => {
    const users = storageService.loadUsers();
    if (Object.keys(users).length === 0) {
      users[DEFAULT_USER_USERNAME] = DEFAULT_USER_PASSWORD; // Store raw password for this example. NOT FOR PRODUCTION.
      storageService.saveUsers(users);
      console.log(`Standaard gebruiker '${DEFAULT_USER_USERNAME}' aangemaakt met wachtwoord '${DEFAULT_USER_PASSWORD}'.`);
    }
    setFamilyData(storageService.loadFamilyData());
  }, []);

  const handleLogin = (username: string, password_raw: string) => {
    const users = storageService.loadUsers();
    if (users[username] && users[username] === password_raw) {
      setCurrentUser({ username });
      setAuthError(null);
      setAppMessage({type: 'success', text: `Welkom terug, ${username}!`});
      setTimeout(() => setAppMessage(null), 3000);
    } else {
      setAuthError("Ongeldige gebruikersnaam of wachtwoord.");
    }
  };

  const handleRegister = (username: string, password_raw: string) => {
    if(!username || !password_raw){
        setAuthError("Gebruikersnaam en wachtwoord mogen niet leeg zijn.");
        return;
    }
    const users = storageService.loadUsers();
    if (users[username]) {
      setAuthError("Gebruikersnaam bestaat al.");
    } else {
      users[username] = password_raw; // Store raw password for this example. NOT FOR PRODUCTION.
      storageService.saveUsers(users);
      setAppMessage({type: 'success', text: "Registratie gelukt! U kunt nu inloggen."});
      setAuthError(null);
       setTimeout(() => setAppMessage(null), 3000);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab(AppTab.ViewAll); // Reset to default tab
    setAppMessage({type: 'success', text: "Succesvol uitgelogd."});
    setTimeout(() => setAppMessage(null), 3000);
  };
  
  const displayAppMessage = (type: 'error' | 'success', text: string) => {
    setAppMessage({ type, text });
    setTimeout(() => setAppMessage(null), 4000);
  };

  const handleMemberSubmit = useCallback((member: FamilyMember, isEditing: boolean): string | null => {
    if (!currentUser) return "U moet ingelogd zijn.";

    let error: string | null = null;
    setFamilyData(prevData => {
      const newData = { ...prevData };
      if (isEditing) {
        if (!newData[member.id]) {
            error = "Lid niet gevonden om te bewerken.";
            return prevData; // no change
        }
        newData[member.id] = member;
        displayAppMessage('success', "Lid succesvol bijgewerkt.");
      } else {
        if (newData[member.id]) {
            error = "Lid ID bestaat al. Kies een andere.";
            return prevData; // no change
        }
        newData[member.id] = member;
        displayAppMessage('success', "Lid succesvol toegevoegd.");
      }
      storageService.saveFamilyData(newData);
      return newData;
    });
    
    if (error) return error;

    if (isEditing) {
        // Optionally clear form or switch tab after edit
        // For now, form shows success message
    } else {
        // Form clears itself on successful add
    }
    return null; // No error from this handler itself
  }, [currentUser]);


  const handleDeleteMember = useCallback((id: string) => {
    if (!currentUser) {
        displayAppMessage('error', "U moet ingelogd zijn om leden te verwijderen.");
        return;
    }
    if (window.confirm(`Weet u zeker dat u lid ${familyData[id]?.firstName || id} wilt verwijderen?`)) {
        setFamilyData(prevData => {
            const newData = { ...prevData };
            delete newData[id];
            storageService.saveFamilyData(newData);
            return newData;
        });
        displayAppMessage('success', "Familielid succesvol verwijderd.");
    }
  }, [currentUser, familyData]);

  const handleStartEditMember = useCallback((id: string) => {
    const member = familyData[id];
    if (member) {
      setMemberToEditInForm(member);
      setEditMemberIdInput(id); // also set the input field in edit tab
      setActiveTab(AppTab.EditMember);
    } else {
      displayAppMessage('error', "Kan lid niet vinden om te bewerken.");
    }
  }, [familyData]);

  const handleLoadMemberForEditing = () => {
    if (!editMemberIdInput) {
        displayAppMessage('error', "Voer een Lid ID in om te laden.");
        return;
    }
    const member = familyData[editMemberIdInput];
    if (member) {
        setMemberToEditInForm(member);
        displayAppMessage('success', `Lid ${member.firstName} geladen voor bewerking.`);
    } else {
        setMemberToEditInForm(null);
        displayAppMessage('error', `Familielid met ID '${editMemberIdInput}' niet gevonden.`);
    }
  };

  const handleRefreshData = useCallback(() => {
    setFamilyData(storageService.loadFamilyData());
    displayAppMessage('success', "Familie data herladen vanuit opslag.");
  }, []);


  if (!currentUser) {
    return <AuthForm onLogin={handleLogin} onRegister={handleRegister} error={authError} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-400">Digitale Familie Boom</h1>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <span className="text-slate-300 text-sm">Ingelogd als: {currentUser.username}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors"
          >
            Uitloggen
          </button>
        </div>
      </header>

      {appMessage && (
        <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg text-white z-50 ${appMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {appMessage.text}
        </div>
      )}

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="mt-2">
        {activeTab === AppTab.AddMember && (
          <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
            <h2 className="text-2xl font-semibold text-blue-400 mb-6">Nieuw Familielid Toevoegen</h2>
            <FamilyMemberForm
              onSubmitMember={handleMemberSubmit}
              existingMemberIds={Object.keys(familyData)}
              formMode="add"
            />
          </div>
        )}
        {activeTab === AppTab.EditMember && (
           <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
            <h2 className="text-2xl font-semibold text-blue-400 mb-6">Familielid Bewerken</h2>
            <div className="mb-6 p-4 bg-slate-700/50 rounded-md border border-slate-600">
                <label htmlFor="editMemberIdInput" className="block text-sm font-medium text-slate-300 mb-1">Lid ID om te bewerken</label>
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        id="editMemberIdInput"
                        value={editMemberIdInput}
                        onChange={(e) => setEditMemberIdInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Voer Lid ID in"
                    />
                    <button 
                        onClick={handleLoadMemberForEditing}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors whitespace-nowrap"
                    >
                        Laad Lid Data
                    </button>
                </div>
            </div>
            {memberToEditInForm ? (
                <FamilyMemberForm
                    memberToEdit={memberToEditInForm}
                    onSubmitMember={handleMemberSubmit}
                    existingMemberIds={Object.keys(familyData).filter(id => id !== memberToEditInForm.id)}
                    formMode="edit"
                    onCancel={() => {
                        setMemberToEditInForm(null);
                        setEditMemberIdInput('');
                    }}
                />
            ) : (
                <p className="text-slate-400 text-center py-4">Voer een Lid ID in en klik op 'Laad Lid Data' om te beginnen met bewerken, of selecteer 'Bewerken' bij een lid in de 'Alles Bekijken' tab.</p>
            )}
           </div>
        )}
        {activeTab === AppTab.ViewAll && (
          <ViewAllMembers
            familyData={familyData}
            onDeleteMember={handleDeleteMember}
            onEditMember={handleStartEditMember}
            onRefreshData={handleRefreshData}
          />
        )}
         {activeTab === AppTab.Insights && (
             <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
                <h2 className="text-2xl font-semibold text-blue-400 mb-6">Familie Inzichten (AI Powered)</h2>
                <p className="text-slate-300 mb-4">
                    Deze sectie gebruikt de Gemini API om interessante inzichten en samenvattingen over uw familie te genereren. 
                    Ga naar de 'Alles Bekijken' tab om de AI-samenvatting te genereren op basis van de ingevoerde familieleden.
                </p>
                <p className="text-slate-400 text-sm">
                    Zorg ervoor dat uw API_KEY correct is geconfigureerd om deze functie te gebruiken.
                </p>
             </div>
        )}
      </main>
      <footer className="text-center text-xs text-slate-500 mt-12 py-4 border-t border-slate-700">
        Familie Boom Programma &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
