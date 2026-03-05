import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-2e7706da/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== Authentication Routes =====

// Sign up new user with role
app.post("/make-server-2e7706da/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name || !role) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since email server isn't configured
      user_metadata: { name, role }
    });

    if (authError) {
      console.log(`Auth error during sign up: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }

    // Create user profile in KV store
    await kv.set(`user:${authData.user.id}`, {
      id: authData.user.id,
      email,
      name,
      role,
      credits: role === 'user' ? 10 : 0, // Free credits for users
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      user: authData.user,
      message: "User created successfully"
    });
  } catch (error) {
    console.log(`Error during sign up: ${error}`);
    return c.json({ error: "Sign up failed" }, 500);
  }
});

// Get user profile
app.get("/make-server-2e7706da/user-profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log(`Error fetching user profile: ${error}`);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Update user credits
app.post("/make-server-2e7706da/update-credits", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { amount } = await c.req.json();
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    profile.credits = (profile.credits || 0) + amount;
    await kv.set(`user:${user.id}`, profile);

    return c.json({ credits: profile.credits });
  } catch (error) {
    console.log(`Error updating credits: ${error}`);
    return c.json({ error: "Failed to update credits" }, 500);
  }
});

// ===== Business Routes =====

// Create or update business
app.post("/make-server-2e7706da/business", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const businessData = await c.req.json();
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const business = {
      ...businessData,
      userId: user.id,
      healthScore: businessData.healthScore || 45,
      createdAt: businessData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`business:${user.id}`, business);

    return c.json({ business });
  } catch (error) {
    console.log(`Error creating/updating business: ${error}`);
    return c.json({ error: "Failed to save business" }, 500);
  }
});

// Get business
app.get("/make-server-2e7706da/business", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const business = await kv.get(`business:${user.id}`);

    return c.json({ business: business || null });
  } catch (error) {
    console.log(`Error fetching business: ${error}`);
    return c.json({ error: "Failed to fetch business" }, 500);
  }
});

// ===== Compliance Tasks Routes =====

// Get compliance tasks
app.get("/make-server-2e7706da/compliance-tasks", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    let tasks = await kv.get(`tasks:${user.id}`);
    
    // Initialize default tasks if none exist
    if (!tasks) {
      tasks = [
        { id: '1', name: 'GST Filing', dueDate: '2026-03-31', status: 'Pending', category: 'GST' },
        { id: '2', name: 'TDS Return', dueDate: '2026-04-30', status: 'Pending', category: 'TDS' },
        { id: '3', name: 'ROC Filing', dueDate: '2026-05-15', status: 'Overdue', category: 'ROC' },
        { id: '4', name: 'PF Compliance', dueDate: '2026-03-15', status: 'Pending', category: 'PF/ESI' },
        { id: '5', name: 'ITR Filing', dueDate: '2026-07-31', status: 'Pending', category: 'ITR' },
      ];
      await kv.set(`tasks:${user.id}`, tasks);
    }

    return c.json({ tasks });
  } catch (error) {
    console.log(`Error fetching compliance tasks: ${error}`);
    return c.json({ error: "Failed to fetch tasks" }, 500);
  }
});

// Update compliance task status
app.post("/make-server-2e7706da/compliance-tasks/:taskId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const taskId = c.req.param('taskId');
    const { status } = await c.req.json();
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const tasks = await kv.get(`tasks:${user.id}`) || [];
    const taskIndex = tasks.findIndex((t: any) => t.id === taskId);
    
    if (taskIndex === -1) {
      return c.json({ error: "Task not found" }, 404);
    }

    tasks[taskIndex].status = status;
    await kv.set(`tasks:${user.id}`, tasks);

    // Update business health score
    const business = await kv.get(`business:${user.id}`);
    if (business) {
      const completedTasks = tasks.filter((t: any) => t.status === 'Done').length;
      business.healthScore = Math.round((completedTasks / tasks.length) * 100);
      await kv.set(`business:${user.id}`, business);
    }

    return c.json({ task: tasks[taskIndex] });
  } catch (error) {
    console.log(`Error updating compliance task: ${error}`);
    return c.json({ error: "Failed to update task" }, 500);
  }
});

// ===== Legal Library Routes =====

app.get("/make-server-2e7706da/legal-library", async (c) => {
  try {
    // Return static legal library data
    const library = [
      {
        id: '1',
        title: 'GST Registration & Filing Guide',
        category: 'GST',
        description: 'Complete guide to GST registration and filing requirements for businesses in India.',
        duePattern: 'Monthly by 20th',
        penalty: '₹10,000 + 18% interest per month for late filing',
        content: 'Detailed GST compliance information...'
      },
      {
        id: '2',
        title: 'ROC Annual Filing Requirements',
        category: 'ROC',
        description: 'Annual filing requirements for companies with the Registrar of Companies.',
        duePattern: 'Within 30 days of AGM',
        penalty: '₹100 per day (max ₹5 lakhs) for delayed filing',
        content: 'ROC filing details...'
      },
      {
        id: '3',
        title: 'Income Tax Return Filing',
        category: 'ITR',
        description: 'Guidelines for filing income tax returns for individuals and businesses.',
        duePattern: 'July 31st annually',
        penalty: '₹5,000 fine + interest for late filing',
        content: 'ITR filing procedures...'
      },
      {
        id: '4',
        title: 'TDS Compliance & Returns',
        category: 'TDS',
        description: 'Tax Deducted at Source compliance requirements and quarterly return filing.',
        duePattern: 'Quarterly by 31st',
        penalty: '₹200 per day for late filing',
        content: 'TDS compliance information...'
      },
      {
        id: '5',
        title: 'PF & ESI Registration Guide',
        category: 'PF/ESI',
        description: 'Provident Fund and Employee State Insurance registration and compliance.',
        duePattern: 'Monthly by 15th',
        penalty: '12% interest + ₹5,000 fine for non-compliance',
        content: 'PF/ESI compliance details...'
      }
    ];

    return c.json({ library });
  } catch (error) {
    console.log(`Error fetching legal library: ${error}`);
    return c.json({ error: "Failed to fetch library" }, 500);
  }
});

// ===== Case Search Routes =====

app.get("/make-server-2e7706da/cases", async (c) => {
  try {
    const query = c.req.query('q') || '';
    
    // Static case data for demo
    const allCases = [
      {
        id: '1',
        title: 'State vs. Raj Kumar',
        court: 'Supreme Court of India',
        caseNumber: 'Crl.A. 1234/2025',
        petitioner: 'State of Maharashtra',
        respondent: 'Raj Kumar',
        crime: 'Murder - IPC 302',
        firNumber: 'FIR 456/2024',
        summary: 'Case involving allegations of premeditated murder. The appellant challenges the lower court conviction.',
        date: '2025-08-15',
        status: 'Ongoing'
      },
      {
        id: '2',
        title: 'Central Bureau of Investigation vs. ABC Corp',
        court: 'Delhi High Court',
        caseNumber: 'CBI/2024/789',
        petitioner: 'CBI',
        respondent: 'ABC Corporation Ltd',
        crime: 'Fraud - IPC 420',
        firNumber: 'FIR 890/2023',
        summary: 'Financial fraud case involving misrepresentation and cheating of investors amounting to ₹500 crores.',
        date: '2024-11-20',
        status: 'Verdict Pending'
      },
      {
        id: '3',
        title: 'Sunita Devi vs. State of Bihar',
        court: 'Patna High Court',
        caseNumber: 'Crl.Rev. 567/2024',
        petitioner: 'Sunita Devi',
        respondent: 'State of Bihar',
        crime: 'Theft - IPC 379',
        firNumber: 'FIR 234/2024',
        summary: 'Appeal against conviction in a theft case. Defense argues lack of evidence.',
        date: '2024-09-10',
        status: 'Closed'
      }
    ];

    // Simple search filter
    const filteredCases = query 
      ? allCases.filter(c => 
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.crime.toLowerCase().includes(query.toLowerCase())
        )
      : allCases;

    return c.json({ cases: filteredCases });
  } catch (error) {
    console.log(`Error searching cases: ${error}`);
    return c.json({ error: "Failed to search cases" }, 500);
  }
});

// ===== Legal Experts Routes =====

app.get("/make-server-2e7706da/experts", async (c) => {
  try {
    const experts = [
      {
        id: '1',
        name: 'Adv. Priya Sharma',
        specialization: 'Corporate Law',
        rating: 4.8,
        reviews: 156,
        isOnline: true,
        experience: '12 years',
        rate: '₹2,000/hour'
      },
      {
        id: '2',
        name: 'Adv. Rajesh Kumar',
        specialization: 'Criminal Law',
        rating: 4.9,
        reviews: 203,
        isOnline: true,
        experience: '15 years',
        rate: '₹2,500/hour'
      },
      {
        id: '3',
        name: 'Adv. Meera Patel',
        specialization: 'Tax & Compliance',
        rating: 4.7,
        reviews: 98,
        isOnline: false,
        experience: '10 years',
        rate: '₹1,800/hour'
      },
      {
        id: '4',
        name: 'Adv. Vikram Singh',
        specialization: 'Family Law',
        rating: 4.6,
        reviews: 145,
        isOnline: true,
        experience: '8 years',
        rate: '₹1,500/hour'
      },
      {
        id: '5',
        name: 'Adv. Anita Desai',
        specialization: 'Intellectual Property',
        rating: 4.9,
        reviews: 187,
        isOnline: false,
        experience: '14 years',
        rate: '₹2,200/hour'
      }
    ];

    return c.json({ experts });
  } catch (error) {
    console.log(`Error fetching experts: ${error}`);
    return c.json({ error: "Failed to fetch experts" }, 500);
  }
});

Deno.serve(app.fetch);