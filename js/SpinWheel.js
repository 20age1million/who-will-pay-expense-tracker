const COLOR_PALETTE = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FFCD56",
    "#C9CBCF",
    "#4D5360",
    "#F7464A",
    "#46BFBD",
    "#FDB45C",
  ];
  
  export class SpinWheel {
    constructor(canvasId, buttonId, persons, dampingExponent = 3.7) {
      console.log("SpinWheel instantiated");
  
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext("2d");
      this.persons = persons;
      this.colors = persons.map((p) => hashNameToColor(p.name)); // Assign colors dynamically
      this.totalWeight = this.calculateTotalWeight();
      this.currentAngle = 0;
      this.wheelRadius = this.canvas.width / 2;
      this.isSpinning = false; // Prevent multiple spins
      this.dampingExponent = dampingExponent; // Control easing (damping)
  
      // Bind spin button
      this.spinButton = document.getElementById(buttonId);
      this.spinButton.addEventListener("click", () => this.spin());
  
      // Initial draw
      this.drawWheel();
    }
  
    calculateTotalWeight() {
      return this.persons.reduce((sum, person) => sum + person.weight, 0);
    }
  
    drawNeedle() {
      this.ctx.fillStyle = "red";
      this.ctx.beginPath();
      this.ctx.moveTo(this.wheelRadius - 15, 5);
      this.ctx.lineTo(this.wheelRadius + 15, 5);
      this.ctx.lineTo(this.wheelRadius, 30);
      this.ctx.closePath();
      this.ctx.fill();
    }
  
    drawWheel() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let startAngle = this.currentAngle;
  
      this.persons.forEach((person, i) => {
        const anglePerSegment = (person.weight / this.totalWeight) * 2 * Math.PI;
        const endAngle = startAngle + anglePerSegment;
  
        // Draw the segment
        this.ctx.beginPath();
        this.ctx.moveTo(this.wheelRadius, this.wheelRadius);
        this.ctx.arc(
          this.wheelRadius,
          this.wheelRadius,
          this.wheelRadius,
          startAngle,
          endAngle
        );
        this.ctx.closePath();
        this.ctx.fillStyle = this.colors[i % this.colors.length];
        this.ctx.fill();
  
        // Draw border
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.stroke();
  
        // Draw label
        const textAngle = startAngle + anglePerSegment / 2;
  
        // Save the current context state
        this.ctx.save();
  
        // Move to the center of the segment
        const labelRadius = this.wheelRadius * 0.7; // adjust 0.7 as desired
        const labelX = this.wheelRadius + labelRadius * Math.cos(textAngle);
        const labelY = this.wheelRadius + labelRadius * Math.sin(textAngle);
  
        // Translate to the label position
        this.ctx.translate(labelX, labelY);
        // Rotate so the text is more aligned with the center
        // Adjust the rotation offset (e.g. -Math.PI/2) to taste
  
        // comment on this line allowed the name to rotate with the circle
        // this.ctx.rotate(textAngle - Math.PI / 2);
  
        // Setup font options
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#000";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
  
        // Draw the text at (0,0) because we translated and rotated the context
        this.ctx.fillText(person.name, 0, 0);
  
        // Restore context to its original state
        this.ctx.restore();
  
        startAngle = endAngle;
      });
  
      this.drawNeedle();
    }
  
    selectRandomWinner() {
      const rand = Math.random() * this.totalWeight;
      let sum = 0;
      for (let person of this.persons) {
        sum += person.weight;
        if (rand < sum) {
          return person.name;
        }
      }
      return this.persons[this.persons.length - 1].name;
    }
  
    spin() {
      if (this.isSpinning) {
        console.log("Spin already in progress");
        return;
      }
      new Audio("assets/audio/滑动变阻器.mp3").play();
      this.isSpinning = true;
      const winner = this.selectRandomWinner();
      console.log("Starting spin with winner candidate:", winner);
      this.spinTo(winner, () => {
        console.log("Animation complete. Declaring winner:", winner);
        new Audio("assets/audio/wow.mp3").play().then(() => {
        alert("The payer is: " + winner);})
        this.isSpinning = false;
      });
    }
  
    spinTo(targetName, callback) {
      let cumulativeAngles = [];
      let angleAcc = 0;
  
      this.persons.forEach((person) => {
        const segmentAngle = (person.weight / this.totalWeight) * 2 * Math.PI;
        cumulativeAngles.push({
          name: person.name,
          startAngle: angleAcc,
          endAngle: angleAcc + segmentAngle,
          // midAngle is still available if needed
          midAngle: angleAcc + segmentAngle / 2,
        });
        angleAcc += segmentAngle;
      });
  
      const targetSegment = cumulativeAngles.find(
        (seg) => seg.name === targetName
      );
      if (!targetSegment) {
        alert("Error: Winner not found!");
        this.isSpinning = false;
        return;
      }
  
      // Instead of aligning the segment's midpoint with -90°, choose a random angle within the segment.
      const randomTargetAngle =
        targetSegment.startAngle +
        Math.random() * (targetSegment.endAngle - targetSegment.startAngle);
      // The needle is fixed at -90° (i.e. -Math.PI/2)
      const desiredAngle = -Math.PI / 2;
      // Compute delta so that randomTargetAngle aligns with the needle.
      const currentTargetAngle = this.currentAngle + randomTargetAngle;
      let delta = desiredAngle - currentTargetAngle;
      // Normalize delta to be within [0, 2π)
      delta = ((delta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  
      // Add extra rotations for visual effect
      const extraRotations = 3 * 2 * Math.PI;
      const totalDelta = delta + extraRotations;
  
      const duration = 4000; // 4 seconds
      const startTime = performance.now();
      const initialAngle = this.currentAngle;
  
      const animate = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Use the configurable dampingExponent for easing
        const easeProgress = 1 - Math.pow(1 - progress, this.dampingExponent);
        this.currentAngle = initialAngle + totalDelta * easeProgress;
        this.drawWheel();
  
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (typeof callback === "function") {
            callback();
          }
        }
      };
  
      requestAnimationFrame(animate);
    }
  }
  
  // Function to generate a color from a name
  // (Using your provided hash function with a slight modification.)
  export function hashNameToColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash); // hash * 31 + char
    }
    // Ensure the hash is non-negative.
    hash = Math.abs(hash);
    // Map the hash to an index within the COLOR_PALETTE array.
    const index = (hash + 4) % COLOR_PALETTE.length;
    return COLOR_PALETTE[index];
  }