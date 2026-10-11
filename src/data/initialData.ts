import { ResumeDocument } from '../types/resume';

export const initialResumes: ResumeDocument[] = [
  {
    id: 'resume-sample-1',
    title: 'Standard ATS Resume',
    updatedAt: new Date().toISOString(),
    content: {
      header: {
        fullName: 'Your Name',
        isPlaceholder: true,
        roles: [],
        headline: '',
        location: 'City, State/Country',
        willingToRelocate: false,
        relocationStatus: '',
        email: 'email@address.com',
        phone: '+65 1234 5678',
        links: [
          {
            id: 'l-1',
            label: 'linkedin.com/in/your_linkedin',
            url: 'https://linkedin.com',
          },
          {
            id: 'l-2',
            label: 'github.com/username',
            url: 'https://github.com',
          },
          {
            id: 'l-3',
            label: 'otherlink.com',
            url: 'https://example.com',
          },
        ],
      },
      sections: [
        {
          id: 'sec-summary',
          type: 'summary',
          title: 'SUMMARY',
          showTitle: false,
          isPlaceholder: true,
          data: { html: '' },
        },
        {
          id: 'sec-experience',
          type: 'experience',
          title: 'WORK EXPERIENCE',
          isPlaceholder: true,
          data: { items: [] },
        },
        {
          id: 'sec-education',
          type: 'education',
          title: 'EDUCATION',
          isPlaceholder: true,
          data: { items: [] },
        },
        {
          id: 'sec-projects',
          type: 'projects',
          title: 'PROJECTS',
          isPlaceholder: true,
          data: { items: [] },
        },
        {
          id: 'sec-skills',
          type: 'skills',
          title: 'SKILLS',
          isPlaceholder: true,
          data: { categories: [] },
        },
      ],
    },
  },
];
