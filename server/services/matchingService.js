const Item = require("../models/Item");
const Match = require("../models/Match");

const { sendMatchNotification } = require("./emailService");

const normalize = (value) => {
  if (!value) return "";

  return value.toString().trim().toLowerCase().replace(/\s+/g, " ");
};

const levenshteinDistance = (a, b) => {
  const matrix = Array.from({ length: b.length + 1 }, () =>
    Array(a.length + 1).fill(0),
  );

  for (let i = 0; i <= b.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

const itemNamesMatch = (name1, name2) => {
  const first = normalize(name1);
  const second = normalize(name2);

  if (!first || !second) {
    return false;
  }

  if (first === second) {
    return true;
  }

  const firstWords = first.split(" ");
  const secondWords = second.split(" ");

  for (const word1 of firstWords) {
    for (const word2 of secondWords) {
      if (word1.length >= 4 && word2.length >= 4) {
        const distance = levenshteinDistance(word1, word2);
        const maxLength = Math.max(word1.length, word2.length);

        const similarity = 1 - distance / maxLength;

        if (similarity >= 0.75) {
          return true;
        }
      }

      // Handles cases such as:
      // iphone ↔ iphone 13
      // galaxy ↔ galaxy s24
      if (
        word1.length >= 4 &&
        word2.length >= 4 &&
        (word1.includes(word2) || word2.includes(word1))
      ) {
        return true;
      }
    }
  }

  return false;
};

const calculateMatchScore = (item1, item2) => {
  let score = 0;

  // --------------------------------
  // Item Type - 25 points
  // --------------------------------
  if (item1.itemType && item2.itemType && item1.itemType !== item2.itemType) {
    score += 25;
  }

  // --------------------------------
  // Company - 20 points
  // --------------------------------
  const company1 = normalize(item1.details?.company);
  const company2 = normalize(item2.details?.company);

  if (company1 && company2 && company1 === company2) {
    score += 20;
  }

  // --------------------------------
  // Location - 25 points
  // --------------------------------
  const location1 = normalize(item1.location);
  const location2 = normalize(item2.location);

  if (location1 && location2 && location1 === location2) {
    score += 25;
  }

  // --------------------------------
  // Color - 20 points
  // --------------------------------
  const color1 = normalize(item1.details?.color);
  const color2 = normalize(item2.details?.color);

  if (color1 && color2 && color1 === color2) {
    score += 20;
  }

  // --------------------------------
  // Item Name - 10 points
  // --------------------------------
  if (itemNamesMatch(item1.itemName, item2.itemName)) {
    score += 10;
  }

  return score;
};

const findMatchesForItem = async (newItem) => {
  try {
    // Lost items are compared only with Found items.
    // Found items are compared only with Lost items.
    const oppositeType = newItem.itemType === "Lost" ? "Found" : "Lost";

    const oppositeItems = await Item.find({
      itemType: oppositeType,
      status: {
        $in: ["Approved", "Matched"],
      },
    });

    const matches = [];

    for (const existingItem of oppositeItems) {
      // Item name must have a meaningful relationship.
      if (!itemNamesMatch(newItem.itemName, existingItem.itemName)) {
        continue;
      }

      const score = calculateMatchScore(newItem, existingItem);

      // Only create a match when there is supporting evidence.
      if (score >= 75) {
        const lostItem =
          newItem.itemType === "Lost" ? newItem._id : existingItem._id;

        const foundItem =
          newItem.itemType === "Found" ? newItem._id : existingItem._id;

        const existingMatch = await Match.findOne({
          lostItem,
          foundItem,
        });

        if (!existingMatch) {
          const match = await Match.create({
            lostItem,
            foundItem,
            score,
            status: "Pending",
          });

          matches.push(match);

          try {
            const lostItemData = await Item.findById(lostItem).populate(
              "reportedBy",
              "name email",
            );

            const foundItemData = await Item.findById(foundItem).populate(
              "reportedBy",
              "name email",
            );

            if (
              lostItemData?.reportedBy?.email &&
              foundItemData?.reportedBy?.email
            ) {
              await sendMatchNotification({
                lostUser: lostItemData.reportedBy,
                foundUser: foundItemData.reportedBy,
                lostItem: lostItemData,
                foundItem: foundItemData,
                score,
              });

              console.log(
                `Match notification emails sent for match ${match._id}`,
              );
            }
          } catch (emailError) {
            console.error(
              "Match created, but email notification failed:",
              emailError.message,
            );
          }
        }
      }
    }

    return matches;
  } catch (error) {
    console.error("Matching service error:", error.message);

    return [];
  }
};

module.exports = {
  findMatchesForItem,
  calculateMatchScore,
  itemNamesMatch,
};
