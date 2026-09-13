import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client with securely stored API key and telemetry headers
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn('WARNING: GEMINI_API_KEY not found in environment variables. AI features will fallback to client-side mock messages.');
}

// ==========================================
// API ROUTES FIRST
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasAiKey: !!apiKey });
});

// 1. Generate Promotional Copy for Gigs
app.post('/api/generate-promo', async (req, res) => {
  const { gig, artist, platform, customInstruction } = req.body;

  if (!gig || !artist || !platform) {
    return res.status(400).json({ error: 'Missing required fields: gig, artist, or platform.' });
  }

  // Fallback if no API key is configured yet
  if (!ai) {
    if (platform === 'twitter') {
      return res.json({
        content: `🎸 LIVE SHOW ALERT! We're hitting the stage at ${gig.venueName} on ${new Date(gig.dateTime).toLocaleDateString([], {month: 'short', day: 'numeric'})}! Can't wait to play our signature ${artist.genre} tracks. Grab your tickets before they sell out! 🎟️🔥\n\nGet tix: ${gig.ticketUrl || 'Link in bio'} ($${gig.ticketPrice})\n\n#LiveMusic #Seattle`,
        status: 'demo_fallback'
      });
    }
    return res.json({
      content: `🎸 [AI Demo Fallback - No GEMINI_API_KEY Set]\n\nHey everyone! ${artist.name} is hitting the stage at ${gig.venueName} on ${new Date(gig.dateTime).toLocaleDateString()} at ${new Date(gig.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}! \n\nCatch us playing our signature ${artist.genre} set. Tickets are $${gig.ticketPrice}. \n\nCan't wait to see you there! 🎟️ Get your tickets here: ${gig.ticketUrl || 'Link in Bio'}\n\n#${artist.name.replace(/\s+/g, '')} #LiveMusic #SeattleMusic #LocalGig #${platform}`,
      status: 'demo_fallback'
    });
  }

  try {
    const prompt = `
      You are a music industry publicist and promotional manager for the local independent band or artist: "${artist.name}".
      They play the genre: "${artist.genre}".
      Bio: "${artist.bio}"
      
      Here are the gig details you need to promote:
      - Gig Title: "${gig.title}"
      - Venue: "${gig.venueName}" (Address: "${gig.venueAddress}")
      - Date & Time: ${new Date(gig.dateTime).toLocaleDateString()} at ${new Date(gig.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      - Ticket Price: $${gig.ticketPrice}
      - Ticket Purchase Link: "${gig.ticketUrl || 'Link in Bio'}"
      - Description: "${gig.description}"
      - Extra Notes: "${gig.notes || 'None'}"
      
      Create highly engaging promotional copy tailored specifically for the platform: "${platform.toUpperCase()}".
      
      ${customInstruction ? `Include the following specific instruction: "${customInstruction}"` : ''}
      
      Guidelines:
      - For Twitter (X): Keep it under 280 characters, include a catchy punchline, the date, the venue, and the ticket link, plus 2-3 essential hashtags. Keep it highly concise.
      - For Instagram: Use spacing, catchy punchlines, relevant emojis, call-to-actions, and 5-10 tailored hashtags. Keep it visually structured.
      - For Facebook: A bit more conversational, focus on community, tag supporting acts if any, invite friends to RSVP, share ticket details.
      - For Newsletter: Create a subject line, pre-header, a warm greeting to subscribers, an immersive story/description of the upcoming gig, a clear calendar block, and a primary button call-to-action.
      - For Press Release: Professional, journalistic, includes a dateline, catchy headline, intro paragraph with the 5 Ws (Who, What, Where, When, Why), band quote, media contact, and boilerplate.
      
      Output ONLY the final polished copy. Do not include meta comments, introductory pleasantries (like "Here is your copy"), or quotes around the entire block.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    const generatedText = response.text || 'Could not generate copy. Please try again.';
    res.json({ content: generatedText.trim() });
  } catch (error: any) {
    console.error('Gemini generate-promo error:', error);
    res.status(500).json({ error: 'AI generation failed: ' + (error.message || error) });
  }
});

// 2. Draft Venue Booking Outreach Email
app.post('/api/generate-outreach', async (req, res) => {
  const { artist, venueName, targetMonth, customDetails } = req.body;

  if (!artist || !venueName) {
    return res.status(400).json({ error: 'Missing required fields: artist or venueName.' });
  }

  if (!ai) {
    return res.json({
      content: `Subject: Gig Booking Inquiry: ${artist.name} (${artist.genre})\n\nDear Booking Manager at ${venueName},\n\nHope this email finds you well!\n\nMy name is Clara and I handle booking for ${artist.name}, a local ${artist.genre} act based out of Seattle.\n\nWe are currently booking gig dates for ${targetMonth || 'upcoming months'} and would love the opportunity to play at ${venueName}. We have a highly active local fan base and bring an energetic, polished performance that keeps crowds staying and supporting the bar.\n\nYou can listen to our music and see our socials here:\n- Instagram: ${artist.instagramUrl || 'instagram.com/band'}\n- Spotify: ${artist.spotifyUrl || 'spotify.com/artist/band'}\n\nWe are happy to jump on a support slot or coordinate a local bill with other similar acts. Thank you so much for your time and consideration. We look forward to hearing from you!\n\nBest regards,\n${artist.members[0] || 'Band Manager'}\n${artist.contactEmail}`,
      status: 'demo_fallback'
    });
  }

  try {
    const prompt = `
      You are an independent booking manager for the local artist/band: "${artist.name}".
      Genre: "${artist.genre}"
      Bio: "${artist.bio}"
      Members: ${artist.members.join(', ')}
      Contact Email: "${artist.contactEmail}"
      Social Links: Instagram (${artist.instagramUrl || 'Not provided'}), Spotify (${artist.spotifyUrl || 'Not provided'})
      
      Write a professional, warm, and highly persuasive gig pitch email to the Booking Manager at the live music venue: "${venueName}".
      The band is hoping to book a slot around the timeframe: "${targetMonth || 'the near future'}".
      
      ${customDetails ? `Custom details to include: "${customDetails}"` : ''}
      
      Guidelines:
      - Subject Line: Needs to be catchy, professional, and clear (e.g., Booking Inquiry: [Band Name] - [Genre] - Proposed Dates).
      - Body: Respectful of the booker's busy schedule. Short and sweet.
      - Hook: Mention why this band is a great fit for their venue specifically (e.g., sound fits their calendar, highly active draw, professional attitude, respect for venue staff).
      - Call to Action: Offer clear links, invite them to a current rehearsal/gig, ask what dates they are trying to fill.
      - Keep it realistic for a local artist. Do not boast about fake awards.
      
      Output ONLY the email (with Subject: at the top). Do not include intro or outro conversational filler.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    res.json({ content: (response.text || '').trim() });
  } catch (error: any) {
    console.error('Gemini generate-outreach error:', error);
    res.status(500).json({ error: 'AI outreach generation failed: ' + (error.message || error) });
  }
});

// 3. Setlist Pacing & Flow Analyzer
app.post('/api/optimize-setlist', async (req, res) => {
  const { songs, gigTitle, durationMinutes } = req.body;

  if (!songs || !Array.isArray(songs)) {
    return res.status(400).json({ error: 'Missing or invalid songs array.' });
  }

  if (!ai) {
    return res.json({
      content: `🎵 [AI Demo Fallback - No GEMINI_API_KEY Set]\n\nSetlist of ${songs.length} songs looks well-balanced!\n\nTips:\n- Start with a high-energy original like "${songs[0]?.title || 'your first song'}" to capture the room's attention immediately.\n- Place any cover songs in the middle of the set to maintain crowd momentum.\n- Save your most anthemic, upbeat track for the grand finale.\n- Ensure you allocate 2-3 minutes for brief transitions, banter, and tuning.`,
      status: 'demo_fallback'
    });
  }

  try {
    const songDetails = songs.map((s, index) => 
      `${index + 1}. "${s.title}" (${Math.floor(s.durationSec / 60)}m ${s.durationSec % 60}s) - BPM: ${s.bpm || 'N/A'}, Key: ${s.key || 'N/A'}, ${s.isOriginal ? 'Original' : 'Cover'}, Status: ${s.status}`
    ).join('\n');

    const totalDurationSec = songs.reduce((acc, s) => acc + s.durationSec, 0);
    const totalDurationMinStr = `${Math.floor(totalDurationSec / 60)}m ${totalDurationSec % 60}s`;

    const prompt = `
      You are an expert live performance musical director and stage manager.
      Analyze the pacing, key flow, BPM transitions, and energy curve for the following proposed live gig setlist:
      
      Gig Event: "${gigTitle || 'Local Showcase'}"
      Target Set Length: ${durationMinutes || 60} minutes
      
      Proposed Setlist (${songs.length} songs, Total playing time of songs is ${totalDurationMinStr}):
      ${songDetails}
      
      Please write a quick, constructive, and inspiring assessment covering:
      1. **Energy & Pacing Curve**: Is the energy starting strong? Does the middle sustain attention? Is the climax effective?
      2. **Key Transitions & Flow**: Do adjacent songs transition smoothly harmonically? (Warn if there are abrupt key clashes, or praise smooth transitions like fourths/fifths).
      3. **BPM & Momentum**: Is there a logical progression of speeds?
      4. **Timing Audit**: Do they have enough time for banter, instrument swaps, and crowd interactions within their ${durationMinutes} minute limit?
      5. **Quick Reordering Proposal**: Give a suggested reordered list ONLY if it would significantly improve the performance flow.
      
      Format with clean Markdown headers and bullet points. Keep it practical, friendly, and actionable for a local independent band.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    res.json({ content: (response.text || '').trim() });
  } catch (error: any) {
    console.error('Gemini optimize-setlist error:', error);
    res.status(500).json({ error: 'AI setlist optimization failed: ' + (error.message || error) });
  }
});

// 4. Search Venue Specs, Capacity & Backline with Google Search Grounding
app.post('/api/venue-search', async (req, res) => {
  const { venueName, locationContext } = req.body;

  if (!venueName || typeof venueName !== 'string' || !venueName.trim()) {
    return res.status(400).json({ error: 'Venue name is required.' });
  }

  const queryVenue = venueName.trim();
  const location = locationContext ? ` located in or near ${locationContext}` : '';

  if (!ai) {
    return res.json({
      venueName: queryVenue,
      address: `123 Music Row, ${locationContext || 'Seattle, WA'}`,
      capacity: '350 standing / 200 seated',
      contactInfo: {
        email: `booking@${queryVenue.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: '(206) 555-0199',
        website: `https://${queryVenue.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        bookingUrl: `https://${queryVenue.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/booking`
      },
      backlineSpecs: {
        paSoundSystem: 'Midas M32 32-Channel Digital Console, QSC Line Array Mains, 4x Stage Wedge Monitors',
        drumKit: 'Yamaha Stage Custom 5-piece shell pack (Drumeers bring: cymbals, snare, kick pedal, hi-hat clutch)',
        guitarBassAmps: "Fender '65 Twin Reverb reissue, Ampeg SVT-CL 8x10 Bass Cab & Head",
        microphonesDi: '6x Shure SM58, 4x SM57, 1x Beta 52A, Radial passive DIs (4 channels)',
        stageDimensions: '24ft wide x 16ft deep x 3ft high stage with 8x8 drum riser',
        lightingMonitors: 'Chauvet DMX LED lighting grid with standard front wash & dynamic scene presets'
      },
      logistics: {
        ageRestriction: '21+ after 9:00 PM (All Ages for matinee slots)',
        loadInInstructions: 'Back alley load-in ramp via service lane. Load-in starts 4:30 PM.',
        curfew: '11:30 PM Sunday-Thursday / 1:00 AM Friday-Saturday',
        merchPolicy: 'Merch table provided stage left with power outlet. Venue takes 0% cut on soft merch.'
      },
      summaryText: `[Demo Mode - Simulated Google Search Grounding for ${queryVenue}]\n\nVerified live music venue with full sound engineering support. Backline available upon 48-hour advance technical rider submission. Please verify with venue booking staff directly.`,
      sources: [
        { title: `${queryVenue} - Official Venue Website`, uri: `https://www.google.com/search?q=${encodeURIComponent(queryVenue + ' venue specs')}` },
        { title: `${queryVenue} Sound & Backline Tech Rider`, uri: `https://www.google.com/search?q=${encodeURIComponent(queryVenue + ' live music tech specs')}` }
      ],
      isDemo: true
    });
  }

  try {
    const prompt = `
      You are an expert live music touring production manager and venue technical director.
      Perform a live web search using Google Search to find current, factual, and verified details for the live music venue: "${queryVenue}"${location}.

      Specifically find and summarize:
      1. Official venue name and physical street address (with city, state/region, zip code).
      2. Room capacity (e.g. 250 cap, 500 standing room, seated theater).
      3. Booking and production contact details: Booking email, phone number, official website, and booking request page.
      4. Backline & Technical Audio Specs:
         - PA sound system & FOH mixing console
         - House drum kit specs (shell pack, hardware, breakables requirements)
         - Guitar & Bass amplifiers / speaker cabinets provided by house
         - Microphones, DI boxes, and stage monitors
         - Stage dimensions & drum riser
         - Stage lighting / visuals
      5. Logistics & House Rules:
         - Age restrictions (21+, 18+, All Ages)
         - Load-in instructions, parking, and load-in time window
         - Sound curfews
         - Merchandise sales policy / venue merch cuts (if known)

      Format your output with:
      First, provide a structured JSON code block wrapped in \`\`\`json ... \`\`\` with the following structure:
      {
        "venueName": "Verified Venue Name",
        "address": "Full Street Address, City, State Zip",
        "capacity": "Capacity description (e.g. 550 standing cap)",
        "contactInfo": {
          "email": "booking email or None listed",
          "phone": "phone number or None listed",
          "website": "official website URL",
          "bookingUrl": "booking form URL or None listed"
        },
        "backlineSpecs": {
          "paSoundSystem": "PA and console details",
          "drumKit": "House drum kit details",
          "guitarBassAmps": "House amps and cabs",
          "microphonesDi": "Mics and DIs available",
          "stageDimensions": "Stage dimensions and risers",
          "lightingMonitors": "Lighting and monitor system"
        },
        "logistics": {
          "ageRestriction": "Age policy (e.g. 21+ / All Ages)",
          "loadInInstructions": "Load-in door, alley access, parking info",
          "curfew": "Curfew details",
          "merchPolicy": "Merch table details and percentage fee if known"
        }
      }

      Second, follow with a concise, formatted Markdown overview highlighting essential touring tips, sound engineer notes, and direct contact guidance for bands playing at this venue.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text || '';
    
    // Extract grounding chunks (URLs and titles) from Google Search Grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Array<{ title: string; uri: string }> = [];

    for (const chunk of groundingChunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || chunk.web.uri,
          uri: chunk.web.uri,
        });
      }
    }

    // Try parsing the JSON block
    let parsedData: any = {};
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedData = JSON.parse(jsonMatch[1]);
      } catch (err) {
        console.warn('Failed to parse JSON from venue search response:', err);
      }
    }

    // Clean up summary text
    const cleanedSummary = responseText.replace(/```json\s*[\s\S]*?\s*```/, '').trim();

    res.json({
      venueName: parsedData.venueName || queryVenue,
      address: parsedData.address || '',
      capacity: parsedData.capacity || 'Verified via Google Search',
      contactInfo: parsedData.contactInfo || {},
      backlineSpecs: parsedData.backlineSpecs || {},
      logistics: parsedData.logistics || {},
      summaryText: cleanedSummary || responseText,
      sources: sources,
      isDemo: false
    });
  } catch (error: any) {
    console.error('Gemini venue search error:', error);
    res.status(500).json({ error: 'Failed to search venue specifications: ' + (error.message || error) });
  }
});

// ==========================================
// VITE OR STATIC SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode using Vite Dev Server as Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Server is running in DEVELOPMENT mode with Vite middleware.');
  } else {
    // Production Mode serving compiled static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Server is running in PRODUCTION mode serving /dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bandaide Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
