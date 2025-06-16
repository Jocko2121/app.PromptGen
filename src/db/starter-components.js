// Starter components configuration
const starterComponents = {
    role: {
        id: 'role_starter',
        type: 'role',
        is_active: true,
        selection: 'default',
        prompt_value: 'You are an expert in your field.',
        user_value: ''
    },
    task: {
        id: 'task_starter',
        type: 'task',
        is_active: true,
        selection: 'default',
        prompt_value: 'Your task is to provide clear and accurate information.',
        user_value: ''
    },
    job: {
        id: 'job_starter',
        type: 'job',
        is_active: true,
        selection: 'default',
        prompt_value: 'Complete the following job with precision and attention to detail.',
        user_value: ''
    },
    // Add more starter components as needed
};

module.exports = starterComponents; 