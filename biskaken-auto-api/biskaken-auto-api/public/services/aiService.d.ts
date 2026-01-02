import { AIDiagnosis, AIInsight } from '../types';
/**
 * AI Service using OpenAI GPT-4
 * Provides AI-powered vehicle diagnosis, business insights, and inventory predictions
 */
declare class AIService {
    private openai;
    constructor();
    /**
     * AI Diagnosis from vehicle complaint
     */
    diagnoseIssue(complaint: string, vehicleInfo?: {
        make: string;
        model: string;
        year: number;
        mileage?: number;
    }): Promise<AIDiagnosis>;
    /**
     * Predict inventory reorder timing and quantity
     */
    predictReorder(partData: {
        partName: string;
        currentStock: number;
        reorderLevel: number;
        usageHistory: Array<{
            date: string;
            quantityUsed: number;
        }>;
        averageLeadTime?: number;
    }): Promise<{
        daysUntilStockout: number;
        recommendedOrderQuantity: number;
        recommendedOrderDate: string;
        reasoning: string;
    }>;
    /**
     * Generate business insights from shop data
     */
    generateInsights(businessData: {
        totalJobs: number;
        completedJobs: number;
        totalRevenue: number;
        topServices: Array<{
            service: string;
            count: number;
            revenue: number;
        }>;
        inventoryAlerts: number;
        averageJobTime: number;
        customerRetention: number;
        monthlyTrend: Array<{
            month: string;
            jobs: number;
            revenue: number;
        }>;
    }): Promise<AIInsight[]>;
    /**
     * Generate maintenance recommendations for vehicles
     */
    generateMaintenanceRecommendations(vehicleData: {
        make: string;
        model: string;
        year: number;
        mileage: number;
        lastServiceDate?: string;
        serviceHistory?: Array<{
            date: string;
            service: string;
            mileage: number;
        }>;
    }): Promise<{
        recommendations: Array<{
            service: string;
            priority: 'Low' | 'Medium' | 'High';
            dueBy: string;
            estimatedCost: string;
            reason: string;
        }>;
        overallCondition: 'Good' | 'Fair' | 'Poor';
        nextServiceDue: string;
    }>;
}
export declare const aiService: AIService;
export {};
//# sourceMappingURL=aiService.d.ts.map