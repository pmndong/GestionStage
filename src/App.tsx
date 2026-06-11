import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProfileSelector from './pages/Interviews/ProfileSelector';
import InterviewList from './pages/Interviews/InterviewList';
import InterviewForm from './pages/Interviews/InterviewForm';
import Observations from './pages/Observations';
import ProcessusPage from './pages/Processus';
import Checklist from './pages/Checklist';
import Dictionnaire from './pages/Dictionnaire';
import Planning from './pages/Planning';
import Impact from './pages/Impact';
import Notes from './pages/Notes';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/interviews" element={<ProfileSelector />} />
        <Route path="/interviews/:profile" element={<InterviewList />} />
        <Route path="/interviews/:profile/:id" element={<InterviewForm />} />
        <Route path="/observations" element={<Observations />} />
        <Route path="/processus" element={<ProcessusPage />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/dictionnaire" element={<Dictionnaire />} />
        <Route path="/notes" element={<Notes />} />
      </Routes>
    </Layout>
  );
}
