function cleanLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function extractEmail(text) {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : "";
}

function extractPhone(text) {
  const match = text.match(
    /(\+?\d{1,2}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/
  );
  return match ? match[0] : "";
}

function extractLinkedIn(text) {
  const match = text.match(/(linkedin\.com\/in\/[^\s]+)/i);
  return match ? match[0] : "";
}

function extractGitHub(text) {
  const match = text.match(/(github\.com\/[^\s]+)/i);
  return match ? match[0] : "";
}

function extractName(lines) {
  if (!lines.length) return "";
  return lines[0];
}

function findSectionIndices(lines) {
  const headings = [
    "education",
    "experience",
    "work experience",
    "projects",
    "technical skills",
    "skills",
    "leadership",
    "activities",
    "involvement",
    "summary",
  ];

  const indices = {};

  lines.forEach((line, index) => {
    const lowered = line.toLowerCase();
    for (const heading of headings) {
      if (lowered === heading || lowered.includes(heading)) {
        if (!(heading in indices)) {
          indices[heading] = index;
        }
      }
    }
  });

  return indices;
}

function getSection(lines, startIndex, allStartIndices) {
  if (startIndex === undefined) return [];

  const nextIndices = Object.values(allStartIndices)
    .filter((index) => index > startIndex)
    .sort((a, b) => a - b);

  const endIndex = nextIndices.length ? nextIndices[0] : lines.length;
  return lines.slice(startIndex + 1, endIndex);
}

function parseSkills(sectionLines) {
  if (!sectionLines.length) return [];

  return sectionLines
    .join(" ")
    .split(/,|\||•/)
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

function groupBulletBlocks(sectionLines) {
  const entries = [];
  let currentEntry = null;

  for (const line of sectionLines) {
    const isBullet =
      line.startsWith("•") || line.startsWith("-") || line.startsWith("*");

    if (!currentEntry) {
      currentEntry = {
        heading: line,
        bullets: [],
      };
      continue;
    }

    if (isBullet) {
      currentEntry.bullets.push(line.replace(/^[•\-*]\s*/, ""));
    } else {
      if (currentEntry.heading && currentEntry.bullets.length > 0) {
        entries.push(currentEntry);
        currentEntry = {
          heading: line,
          bullets: [],
        };
      } else if (currentEntry.heading) {
        currentEntry.heading += " " + line;
      }
    }
  }

  if (currentEntry) {
    entries.push(currentEntry);
  }

  return entries;
}

function parseResumeText(text) {
  const lines = cleanLines(text);
  const indices = findSectionIndices(lines);

  const educationLines =
    getSection(
      lines,
      indices.education,
      indices
    );

  const experienceLines =
    getSection(
      lines,
      indices.experience ?? indices["work experience"],
      indices
    );

  const projectsLines =
    getSection(
      lines,
      indices.projects,
      indices
    );

  const skillsLines =
    getSection(
      lines,
      indices["technical skills"] ?? indices.skills,
      indices
    );

  const leadershipLines =
    getSection(
      lines,
      indices.leadership ?? indices.activities ?? indices.involvement,
      indices
    );

  return {
    name: extractName(lines),
    email: extractEmail(text),
    phone: extractPhone(text),
    linkedin: extractLinkedIn(text),
    github: extractGitHub(text),
    education: educationLines,
    experience: groupBulletBlocks(experienceLines),
    projects: groupBulletBlocks(projectsLines),
    skills: parseSkills(skillsLines),
    leadership: groupBulletBlocks(leadershipLines),
  };
}

module.exports = { parseResumeText };