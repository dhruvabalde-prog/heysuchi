export type MissionDomain = 'Life' | 'Work';

export type MissionStatus = 'queued' | 'planning' | 'working' | 'needs_you' | 'blocked' | 'completed' | 'done';

export interface Task {
  id: string;
  missionId: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
}

export interface Decision {
  id: string;
  missionId: string;
  question: string;
  options: string[];
  status: 'pending' | 'answered';
  answer?: string;
}

export interface MissionArtifact {
  id: string;
  missionId: string;
  title: string;
  content: string; // e.g., Markdown content
  createdAt: string;
}

export interface Mission {
  id: string;
  title: string;
  originalInput: string;
  domain: MissionDomain;
  status: MissionStatus;
  progress: number; // 0 to 100
  nextAction?: string;
  tasks: Task[];
  decisions: Decision[];
  artifacts: MissionArtifact[];
  activity: string[];
  connectedContext?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
