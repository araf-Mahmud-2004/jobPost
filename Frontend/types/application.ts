export interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: {
      name: string;
    };
  };
  user: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      title?: string;
      skills?: string[];
    };
  };
  status: 'pending' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';
  appliedAt: string;
  coverLetter?: string;
  resume: string;
  notes?: string;
  feedback?: string;
  interviewDate?: string;
}
