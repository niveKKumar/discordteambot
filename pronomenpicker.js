const pronomen = [{ name: "He/Him" }];
const { MessageActionRow, MessageButton } = require("discord.js");

const buttons = [];
let row = new MessageActionRow();
pronomen.map((pronom, index) => {
  if (index % 5 === 0) {
    console.log(index, " is jeder 5te");
    buttons.push(row);
    row = new MessageActionRow();
  }
  row.addComponents(new MessageButton().setCustomId("pronom.name").setLabel("pronom.name").setStyle("RANDOM"));
});

module.exports = { buttons };
