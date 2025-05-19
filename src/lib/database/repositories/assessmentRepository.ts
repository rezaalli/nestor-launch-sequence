/**
 * Assessment Repository
 * Handles operations related to daily assessments
 */

import { v4 as uuidv4 } from 'uuid';
import { DataStore, STORES } from '../db';
import { Assessment, AssessmentResponse } from '../schema';

// Type adapter to match the Assessment schema with DataStore requirements
type AssessmentWithId = Assessment & { id: string };

export class AssessmentRepository {
  private store: DataStore<AssessmentWithId>;
  
  constructor() {
    this.store = new DataStore<AssessmentWithId>(STORES.ASSESSMENTS);
  }
  
  /**
   * Save a completed assessment
   */
  async saveAssessment(assessmentData: {
    user_id: string;
    date: string;
    responses: AssessmentResponse[];
    readiness_score?: number;
  }): Promise<Assessment> {
    const now = new Date().toISOString();
    const id = uuidv4();
    
    const assessment: AssessmentWithId = {
      id,
      ...assessmentData,
      readiness_score: assessmentData.readiness_score || null,
      completed_at: now,
      created_at: now,
      updated_at: now,
      is_synced: false
    };
    
    const savedAssessment = await this.store.saveItem(assessment);
    return savedAssessment;
  }
  
  /**
   * Update an existing assessment
   */
  async updateAssessment(assessmentId: string, updates: Partial<Omit<Assessment, 'id' | 'created_at'>>): Promise<Assessment | null> {
    const updatedAssessment = await this.store.updateItem(assessmentId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    
    return updatedAssessment;
  }
  
  /**
   * Get assessment for a specific date
   */
  async getAssessmentForDate(userId: string, date: string): Promise<Assessment | null> {
    const assessments = await this.store.query(item => 
      item.user_id === userId &&
      item.date === date
    );
    
    return assessments.length > 0 ? assessments[0] : null;
  }
  
  /**
   * Get assessments for a date range
   */
  async getAssessmentsInRange(userId: string, startDate: string, endDate: string): Promise<Assessment[]> {
    return this.store.query(item => 
      item.user_id === userId &&
      item.date >= startDate &&
      item.date <= endDate
    );
  }
  
  /**
   * Get recent assessments
   */
  async getRecentAssessments(userId: string, limit: number = 7): Promise<Assessment[]> {
    const assessments = await this.store.query(item => item.user_id === userId);
    
    // Sort by date in descending order
    return assessments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
  
  /**
   * Update readiness score for an assessment
   */
  async updateReadinessScore(assessmentId: string, readinessScore: number): Promise<Assessment | null> {
    return this.store.updateItem(assessmentId, {
      readiness_score: readinessScore,
      updated_at: new Date().toISOString()
    });
  }
  
  /**
   * Get unsynced assessments
   */
  async getUnsyncedAssessments(): Promise<Assessment[]> {
    return this.store.query(item => item.is_synced === false);
  }
  
  /**
   * Mark assessments as synced
   */
  async markAsSynced(ids: string[]): Promise<boolean> {
    try {
      await Promise.all(
        ids.map(id => this.store.updateItem(id, { is_synced: true }))
      );
      return true;
    } catch (error) {
      console.error('Error marking assessments as synced:', error);
      return false;
    }
  }
  
  /**
   * Delete an assessment
   */
  async deleteAssessment(assessmentId: string): Promise<boolean> {
    return this.store.deleteItem(assessmentId);
  }
  
  /**
   * Get assessments updated since a specific time
   */
  async getAssessmentsUpdatedSince(timestamp: string): Promise<Assessment[]> {
    return this.store.query(item => 
      new Date(item.updated_at) > new Date(timestamp)
    );
  }
  
  /**
   * Check if user has completed today's assessment
   */
  async hasTodayAssessment(userId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const assessment = await this.getAssessmentForDate(userId, today);
    return !!assessment;
  }
} 