import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';
export const updateUserProgress = async (phoneNumber, courseId, lessonNumber) => {
    try {
        // 1. Check if a progress record already exists for this user and course
        const existing = await pool.query(`SELECT completed_lessons FROM user_progress WHERE phone_number = $1 AND course_id = $2`, [phoneNumber, courseId]);
        if (existing.rows.length === 0) {
            // Insert initial record if it doesn't exist
            await pool.query(`INSERT INTO user_progress (phone_number, course_id, completed_lessons, updated_at) 
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`, [phoneNumber, courseId, lessonNumber]);
        }
        else {
            // Update only if the new completed lesson count is higher than what was stored
            const currentCompleted = existing.rows[0].completed_lessons;
            if (lessonNumber > currentCompleted) {
                const isCompleted = lessonNumber >= 2; // Assuming 2 total lessons for Bookkeeping MVP
                await pool.query(`UPDATE user_progress 
           SET completed_lessons = $1, is_completed = $2, updated_at = CURRENT_TIMESTAMP 
           WHERE phone_number = $3 AND course_id = $4`, [lessonNumber, isCompleted, phoneNumber, courseId]);
            }
        }
        logger.info('User progress updated successfully', { phoneNumber, courseId, lessonNumber });
    }
    catch (error) {
        logger.error('Failed to update user progress', { error, phoneNumber, courseId });
    }
};
export const getUserProgress = async (phoneNumber, courseId) => {
    try {
        const result = await pool.query(`SELECT completed_lessons FROM user_progress WHERE phone_number = $1 AND course_id = $2`, [phoneNumber, courseId]);
        return result.rows.length > 0 ? result.rows[0].completed_lessons : 0;
    }
    catch (error) {
        logger.error('Failed to fetch user progress', { error, phoneNumber, courseId });
        return 0;
    }
};
