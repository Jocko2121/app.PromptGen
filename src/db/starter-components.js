// Default components for initialization, moved from builderComponentData in public/index.html

const starterComponents = {
    role: {
        title: 'Role',
        prompts: {
            'Assistant': 'Act as a helpful, expert-level assistant. Your goal is to provide responses that are not only accurate and relevant but also clear, well-structured, and easy to understand. Anticipate user needs and provide comprehensive information where appropriate.',
            'CEO': 'Adopt the persona of a seasoned and decisive CEO of a publicly-traded technology company. Your communication style must be strategic, concise, and forward-looking. Focus on market dynamics, competitive landscape, and shareholder value. Avoid overly technical jargon and focus on the "big picture".',
            'Software Engineer': 'Act as a Principal Software Engineer with deep expertise in system design and scalable cloud architecture. Your response must be technically precise, using appropriate terminology for data structures, algorithms, and design patterns. Provide code examples where they clarify your points.',
            'Screenwriter': 'Adopt the persona of a professional screenwriter with several produced credits. Your task is to think visually and structurally. Describe scenes, actions, and dialogue with clarity and brevity. Ensure your output adheres to standard screenplay formatting conventions.',
            'Academic Researcher': 'Act as an academic researcher and university professor publishing in a peer-reviewed journal. Your response must be rigorous, analytical, and evidence-based. Cite sources, define key terms, and present arguments with logical coherence and intellectual nuance.'
        }
    },
    task: {
        title: 'Task',
        prompts: {
            'Write': "Your primary task is to create original written content based on the user's request. Pay close attention to the specified format, tone, and length. The final output must be well-organized, coherent, and free of grammatical errors.",
            'Analyze': "Your primary task is to conduct a detailed analysis of the provided text or data. Identify the key components, patterns, relationships, and underlying assumptions. The output should be a structured summary of your findings, not just a restatement of the information.",
            'Summarize': 'Your primary task is to create a concise and accurate summary of the provided text. The summary must capture the main ideas, key arguments, and essential conclusions of the original content without introducing outside information or opinion.',
            'Translate': 'Your primary task is to translate the provided text from the source language to the target language specified by the user. The translation must be accurate, fluent, and culturally appropriate, preserving the meaning and nuance of the original text.',
            'Brainstorm': 'Your primary task is to generate a diverse and creative list of ideas related to the given topic. The list should include a range of concepts, from conventional and practical to innovative and "outside-the-box". Organize the ideas into logical categories if applicable.'
        }
    },
    job: {
        title: 'Job',
        prompts: {
            'Writing Assistant': 'Act as a helpful general-purpose writing assistant.',
            'Blog Post': 'Specify the output format must be a well-structured blog post. It needs a catchy H1 title, an engaging introduction (hook), clear H2 subheadings for main sections, and a concluding summary.',
            'Formal Email': 'Specify the output must be a professional email. It requires a clear subject line, a proper salutation (e.g., "Dear [Name],"), a body in clear paragraphs, and a professional closing (e.g., "Best regards,").',
            'Press Release': 'Specify the output must follow the format of a standard press release. It requires a headline, dateline, introduction (the 5 Ws), body, boilerplate, and contact information. The tone must be formal and objective.'
        }
    },
    audiencePro: {
        title: 'Audience - Professional',
        prompts: {
            'executive': 'Adapt the tone for a C-suite executive. Focus on strategic implications, business outcomes, and ROI. Use concise, confident, data-driven language. Omit granular technical details.',
            'technicalExperts': 'Write for a highly technical audience (e.g., engineers, developers). Use precise, domain-specific terminology. Do not oversimplify complex concepts. Provide detailed explanations.',
            'generalPublic': 'Simplify the language for a general, non-expert audience. Use analogies and relatable examples. Avoid or clearly explain jargon and acronyms. The tone should be accessible and engaging.'
        }
    },
    audienceSilly: {
        title: 'Audience - Silly',
        prompts: {
            'shakespeare': 'Instruct the AI to adopt the persona of William Shakespeare. The response must be written in a grandiloquent style, employing iambic rhythm where possible, with antiquated flourishes.',
            'a6YearOld': 'Instruct the AI to explain the concept as if speaking to a six-year-old child. It must use extremely simple words, short sentences, and friendly, relatable analogies (e.g., cookies, puppies).',
            'genZSlang': 'Instruct the AI to adopt the persona of a Gen Z TikToker. The response must use popular, current slang (e.g., "no cap," "the vibe," "bet," "low-key"). The tone should be informal and extremely online.',
            'noirDetective': 'Instruct the AI to write in the style of a hardboiled noir detective. The response should be a cynical, world-weary internal monologue with short sentences and gritty metaphors.',
            'terriblePoetry': 'Instruct the AI to act as a poet who is trying very hard but has no talent. The response must be a poem that uses excessive, flowery language, forced rhymes, broken meter, and overly dramatic, cliché metaphors.'
        }
    },
    format: {
        title: 'Format',
        prompts: {
            'Paragraphs': 'Instruct the AI to structure the entire response in well-formed paragraphs. Each paragraph should focus on a single, coherent idea.',
            'Bulleted List': 'Instruct the AI to present the key information as a main bulleted list. Each bullet point should be a clear and concise statement. Use sub-bullets for hierarchical data if necessary.',
            'Q&A Format': 'Instruct the AI to structure the entire response as a Frequently Asked Questions (FAQ) section. Each major point should be phrased as a question followed by a direct and comprehensive answer.',
            'JSON': 'The final output must be a single, valid, and well-formed JSON object. Ensure all keys are enclosed in double quotes and that the structure is properly nested according to the request. Do not include any explanatory text outside of the JSON structure itself.',
            'Markdown Table': 'Structure the entire response as a single, properly formatted Markdown table. The first row must be the table header, followed by a separator line. Each subsequent row should represent a data entry with columns aligned.'
        }
    },
    tone: {
       title: 'Tone',
       prompts: {
           'Persuasive': 'Instruct the AI to adopt a persuasive tone with the primary goal of convincing the reader. It should use rhetorical techniques, strong verbs, compelling evidence, and end with a clear call to action.',
           'Empathetic': 'Instruct the AI to use an empathetic and supportive tone. It must acknowledge the reader\'s potential feelings or challenges on the topic, using phrases that convey understanding and validation.',
           'Formal': 'Instruct the AI to adopt a formal and academic tone. It must use complete sentences, proper grammar, and sophisticated vocabulary, while avoiding contractions, slang, or overly familiar language.',
           'Casual': 'Instruct the AI to adopt a casual, conversational tone that is friendly and approachable, as if speaking to a colleague. It can use contractions and simpler language where appropriate.',
           'Professional': 'Adopt a professional and objective tone suitable for a corporate or business setting. The language should be formal, respectful, and clear. Avoid slang, contractions, and overly casual phrasing.'
       }
   },
   length: {
        title: 'Length',
        prompts: {
            'Concise Summary': 'Constrain the final output to a concise summary of approximately 150-200 words. Instruct the AI to focus only on the most critical points and high-level takeaways.',
            'Standard Article': 'Specify the desired length is a standard article of about 500-700 words. Instruct the AI to develop the main points with sufficient detail, examples, and explanation.',
            'In-Depth Paper': 'Specify the desired length is a comprehensive, in-depth document of 1500 words or more. Instruct the AI to explore the topic thoroughly, including nuances, multiple perspectives, and detailed evidence.'
        }
    },
    pov: {
        title: 'Point of View',
        prompts: {
            'First Person (I/We)': 'Instruct the AI to write the entire response from a first-person point of view ("I" or "we"). This is useful for personal narratives, opinion pieces, or company statements.',
            'Second Person (You)': 'Instruct the AI to address the reader directly using a second-person point of view ("you"). This is effective for instructions, guides, marketing copy, and user manuals.',
            'Third Person (He/She/It)': 'Instruct the AI to use a third-person objective point of view ("he," "she," "it," or "they"), maintaining a narrative or descriptive distance from the subject matter.'
        }
    },
    context: { title: 'Context' },
    constraints: { title: 'Constraints' }
};

module.exports = starterComponents; 