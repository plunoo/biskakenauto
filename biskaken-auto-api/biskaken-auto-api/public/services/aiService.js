"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const openai_1 = __importDefault(require("openai"));
/**
 * AI Service using OpenAI GPT-4
 * Provides AI-powered vehicle diagnosis, business insights, and inventory predictions
 */
class AIService {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY is not configured - AI features will be disabled');
            this.openai = null;
        }
        else {
            this.openai = new openai_1.default({
                apiKey: process.env.OPENAI_API_KEY
            });
        }
    }
    /**
     * AI Diagnosis from vehicle complaint
     */
    async diagnoseIssue(complaint, vehicleInfo) {
        if (!this.openai) {
            // Return mock diagnosis when OpenAI is not available
            return {
                diagnosis: 'AI diagnosis unavailable - OpenAI API key not configured',
                confidence: 0,
                estimatedCostRange: 'N/A',
                suggestedParts: [],
                repairTime: 'N/A',
                urgency: 'Low'
            };
        }
        try {
            const vehicleDetails = vehicleInfo
                ? `Vehicle: ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}${vehicleInfo.mileage ? `, Mileage: ${vehicleInfo.mileage}km` : ''}`
                : '';
            const prompt = `You are an expert automotive technician with 20+ years of experience in auto repair in Ghana. 

Customer complaint: "${complaint}"
${vehicleDetails}

Based on this complaint, provide a professional diagnosis with the following information:

1. Most likely diagnosis (detailed technical explanation)
2. Confidence level (0.0 to 1.0)
3. Estimated cost range in Ghana Cedis (GHS) - consider local pricing
4. List of parts likely needed (specific part names)
5. Estimated repair time (hours or days)
6. Urgency level (Low, Medium, High)

Consider common issues in Ghana's climate and road conditions. Be practical and cost-effective.

Respond in JSON format with keys: diagnosis, confidence, estimatedCostRange, suggestedParts, repairTime, urgency`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional automotive diagnostic expert specializing in vehicles in Ghana. Provide accurate, practical diagnoses with local pricing context.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
                max_tokens: 1000
            });
            const result = JSON.parse(response.choices[0].message.content || '{}');
            // Validate and format response
            return {
                diagnosis: result.diagnosis || 'Unable to diagnose - requires physical inspection',
                confidence: Math.min(Math.max(result.confidence || 0.5, 0), 1),
                estimatedCostRange: result.estimatedCostRange || 'GHS 200 - 500',
                suggestedParts: Array.isArray(result.suggestedParts) ? result.suggestedParts : [],
                repairTime: result.repairTime || '2-4 hours',
                urgency: ['Low', 'Medium', 'High'].includes(result.urgency) ? result.urgency : 'Medium'
            };
        }
        catch (error) {
            console.error('AI Diagnosis Error:', error);
            // Fallback response
            return {
                diagnosis: 'AI diagnosis unavailable - manual inspection required',
                confidence: 0.1,
                estimatedCostRange: 'Contact shop for estimate',
                suggestedParts: [],
                repairTime: 'TBD',
                urgency: 'Medium'
            };
        }
    }
    /**
     * Predict inventory reorder timing and quantity
     */
    async predictReorder(partData) {
        try {
            const prompt = `Analyze this auto parts inventory data and predict optimal reorder timing:

Part: ${partData.partName}
Current Stock: ${partData.currentStock}
Reorder Level: ${partData.reorderLevel}
Average Lead Time: ${partData.averageLeadTime || 7} days
Usage History: ${JSON.stringify(partData.usageHistory)}

Calculate:
1. Days until stockout based on usage trend
2. Recommended order quantity (consider lead time, usage rate, safety stock)
3. Optimal order date (accounting for lead time)
4. Brief reasoning for recommendations

Consider seasonal variations and typical auto repair patterns in Ghana.

Respond in JSON format with keys: daysUntilStockout, recommendedOrderQuantity, recommendedOrderDate, reasoning`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an inventory management expert for auto repair shops. Provide data-driven recommendations.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.2,
                max_tokens: 500
            });
            const result = JSON.parse(response.choices[0].message.content || '{}');
            return {
                daysUntilStockout: Math.max(result.daysUntilStockout || 30, 0),
                recommendedOrderQuantity: Math.max(result.recommendedOrderQuantity || partData.reorderLevel * 2, 1),
                recommendedOrderDate: result.recommendedOrderDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                reasoning: result.reasoning || 'Standard reorder recommendation based on current stock levels'
            };
        }
        catch (error) {
            console.error('AI Inventory Prediction Error:', error);
            // Fallback calculation
            const avgDailyUsage = partData.usageHistory.length > 0
                ? partData.usageHistory.reduce((sum, item) => sum + item.quantityUsed, 0) / partData.usageHistory.length
                : 1;
            const daysUntilStockout = Math.floor(partData.currentStock / Math.max(avgDailyUsage, 0.1));
            return {
                daysUntilStockout,
                recommendedOrderQuantity: partData.reorderLevel * 3,
                recommendedOrderDate: new Date(Date.now() + Math.max(daysUntilStockout - 7, 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                reasoning: 'Basic calculation - AI prediction unavailable'
            };
        }
    }
    /**
     * Generate business insights from shop data
     */
    async generateInsights(businessData) {
        try {
            const prompt = `Analyze this auto shop business data and provide 3-5 actionable insights:

Business Metrics:
- Total Jobs: ${businessData.totalJobs}
- Completed Jobs: ${businessData.completedJobs}
- Total Revenue: GHS ${businessData.totalRevenue}
- Top Services: ${JSON.stringify(businessData.topServices)}
- Inventory Alerts: ${businessData.inventoryAlerts}
- Average Job Time: ${businessData.averageJobTime} days
- Customer Retention: ${businessData.customerRetention}%
- Monthly Trend: ${JSON.stringify(businessData.monthlyTrend)}

Provide insights on:
1. Revenue optimization opportunities
2. Operational efficiency improvements
3. Inventory management recommendations
4. Customer service enhancements
5. Growth opportunities

Each insight should include:
- Category (Revenue, Operations, Inventory, Customer, Growth)
- Specific recommendation
- Impact level (Low, Medium, High)
- Whether immediate action is required

Respond as JSON array with objects containing keys: category, recommendation, impact, actionRequired`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a business consultant specializing in auto repair shop optimization. Provide specific, actionable insights.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.4,
                max_tokens: 1200
            });
            const result = JSON.parse(response.choices[0].message.content || '{}');
            // Extract insights array from response
            const insights = result.insights || result.recommendations || [];
            return Array.isArray(insights) ? insights.map((insight) => ({
                category: insight.category || 'Operations',
                recommendation: insight.recommendation || insight.insight || 'No specific recommendation available',
                impact: ['Low', 'Medium', 'High'].includes(insight.impact) ? insight.impact : 'Medium',
                actionRequired: Boolean(insight.actionRequired)
            })) : [
                {
                    category: 'Operations',
                    recommendation: 'Review business metrics regularly to identify improvement opportunities',
                    impact: 'Medium',
                    actionRequired: false
                }
            ];
        }
        catch (error) {
            console.error('AI Insights Error:', error);
            // Fallback insights based on data
            const completionRate = businessData.totalJobs > 0 ? businessData.completedJobs / businessData.totalJobs : 0;
            const fallbackInsights = [];
            if (completionRate < 0.8) {
                fallbackInsights.push({
                    category: 'Operations',
                    recommendation: 'Focus on improving job completion rate - currently below 80%',
                    impact: 'High',
                    actionRequired: true
                });
            }
            if (businessData.inventoryAlerts > 5) {
                fallbackInsights.push({
                    category: 'Inventory',
                    recommendation: 'Address inventory shortages - multiple items need restocking',
                    impact: 'Medium',
                    actionRequired: true
                });
            }
            if (businessData.averageJobTime > 5) {
                fallbackInsights.push({
                    category: 'Operations',
                    recommendation: 'Consider streamlining processes to reduce average job completion time',
                    impact: 'Medium',
                    actionRequired: false
                });
            }
            return fallbackInsights.length > 0 ? fallbackInsights : [
                {
                    category: 'General',
                    recommendation: 'Continue monitoring business metrics for optimization opportunities',
                    impact: 'Low',
                    actionRequired: false
                }
            ];
        }
    }
    /**
     * Generate maintenance recommendations for vehicles
     */
    async generateMaintenanceRecommendations(vehicleData) {
        try {
            const prompt = `Based on this vehicle information, recommend maintenance services:

Vehicle: ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}
Current Mileage: ${vehicleData.mileage}km
Last Service: ${vehicleData.lastServiceDate || 'Unknown'}
Service History: ${JSON.stringify(vehicleData.serviceHistory || [])}

Consider:
1. Standard maintenance intervals for this vehicle
2. Ghana's driving conditions (dust, heat, poor roads)
3. Age and mileage factors
4. Service history patterns

Provide:
- Specific maintenance recommendations with priority levels
- Estimated costs in Ghana Cedis
- Overall vehicle condition assessment
- Next service due date/mileage

Respond in JSON format with keys: recommendations (array), overallCondition, nextServiceDue`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an automotive maintenance expert familiar with vehicle service requirements in Ghana.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
                max_tokens: 1000
            });
            const result = JSON.parse(response.choices[0].message.content || '{}');
            return {
                recommendations: Array.isArray(result.recommendations) ? result.recommendations : [
                    {
                        service: 'Oil Change',
                        priority: 'Medium',
                        dueBy: '5,000km',
                        estimatedCost: 'GHS 150-200',
                        reason: 'Regular maintenance interval'
                    }
                ],
                overallCondition: ['Good', 'Fair', 'Poor'].includes(result.overallCondition) ? result.overallCondition : 'Fair',
                nextServiceDue: result.nextServiceDue || 'Within 3 months'
            };
        }
        catch (error) {
            console.error('AI Maintenance Recommendations Error:', error);
            // Basic maintenance recommendations based on mileage
            const recommendations = [];
            const mileage = vehicleData.mileage;
            if (mileage % 5000 < 1000) {
                recommendations.push({
                    service: 'Oil Change & Filter',
                    priority: 'Medium',
                    dueBy: 'Now',
                    estimatedCost: 'GHS 150-200',
                    reason: '5,000km service interval'
                });
            }
            if (mileage % 10000 < 1000) {
                recommendations.push({
                    service: 'Full Service',
                    priority: 'High',
                    dueBy: 'Now',
                    estimatedCost: 'GHS 400-600',
                    reason: '10,000km major service'
                });
            }
            return {
                recommendations,
                overallCondition: 'Fair',
                nextServiceDue: 'Next 1,000km or 3 months'
            };
        }
    }
}
exports.aiService = new AIService();
//# sourceMappingURL=aiService.js.map