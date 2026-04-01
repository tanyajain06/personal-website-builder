function cleanLines(text) {
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
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
  const match = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[^\s)]+/i);
  return match ? match[0] : "";
}

function extractGitHub(text) {
  const match = text.match(/(https?:\/\/)?(www\.)?github\.com\/[^\s)]+/i);
  return match ? match[0] : "";
}

function extractName(lines) {
  return lines.length ? lines[0] : "";
}

function normalizeHeading(line) {
  return line.toLowerCase().replace(/[^a-z\s]/g, "").trim();
}

function isLikelySectionHeading(line) {
  const normalized = normalizeHeading(line);
  const headings = [
    "education",
    "experience",
    "work experience",
    "professional experience",
    "projects",
    "technical skills",
    "skills",
    "leadership",
    "activities",
    "involvement",
  ];
  return headings.includes(normalized);
}

function findSectionIndices(lines) {
  const indices = {};

  lines.forEach((line, index) => {
    const normalized = normalizeHeading(line);

    if (normalized === "education") indices.education = index;
    if (normalized === "experience") indices.experience = index;
    if (normalized === "work experience") indices.workExperience = index;
    if (normalized === "professional experience") indices.professionalExperience = index;
    if (normalized === "projects") indices.projects = index;
    if (normalized === "technical skills") indices.technicalSkills = index;
    if (normalized === "skills") indices.skills = index;
    if (normalized === "leadership") indices.leadership = index;
    if (normalized === "activities") indices.activities = index;
    if (normalized === "involvement") indices.involvement = index;
  });

  return indices;
}

function getSection(lines, startIndex) {
  if (startIndex === undefined) return [];

  const collected = [];
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    if (isLikelySectionHeading(lines[i])) break;
    collected.push(lines[i]);
  }
  return collected;
}

function parseSkills(sectionLines) {
  return sectionLines
    .join(" | ")
    .split(/,|\||•|·/)
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

function groupBulletBlocks(sectionLines) {
  const entries = [];
  let currentEntry = null;

  for (const line of sectionLines) {
    const isBullet = /^[•*\-]/.test(line);

    if (!currentEntry) {
      currentEntry = { heading: line, bullets: [] };
      continue;
    }

    if (isBullet) {
      currentEntry.bullets.push(line.replace(/^[•*\-]\s*/, ""));
    } else {
      if (currentEntry.bullets.length > 0) {
        entries.push(currentEntry);
        currentEntry = { heading: line, bullets: [] };
      } else {
        currentEntry.heading = `${currentEntry.heading} ${line}`.trim();
      }
    }
  }

  if (currentEntry) {
    entries.push(currentEntry);
  }

  return entries.filter(
    (entry) => entry.heading || (entry.bullets && entry.bullets.length > 0)
  );
}

function parseResumeText(text) {
  const lines = cleanLines(text);
  const indices = findSectionIndices(lines);

  const educationLines = getSection(lines, indices.education);
  const experienceLines = getSection(
    lines,
    indices.experience ?? indices.workExperience ?? indices.professionalExperience
  );
  const projectsLines = getSection(lines, indices.projects);
  const skillsLines = getSection(lines, indices.technicalSkills ?? indices.skills);
  const leadershipLines = getSection(
    lines,
    indices.leadership ?? indices.activities ?? indices.involvement
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