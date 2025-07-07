import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

function CatModel({ virusType }) {
  return (
    <mesh position={[0, 1, 0]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={virusType === 'FIP' ? 'red' : 'orange'}
        roughness={0.5}
        metalness={0.1}
      />
    </mesh>
  );
}

function simulateTreatment({ virusType, stress, nutrition, catAge, days }) {
  const graphData = [];
  let virus = 100;
  let bacteria = 80;

  const stressFactor = stress / 100;
  const nutritionFactor = (100 - nutrition) / 100;
  const ageFactor = catAge === 'kitten' ? 1.2 : catAge === 'senior' ? 1.3 : 1.0;

  for (let day = 1; day <= days; day++) {
    virus -= Math.random() * 5 - stressFactor * 2 + ageFactor;
    bacteria -= Math.random() * 4 - nutritionFactor * 2 + ageFactor;

    virus = Math.max(0, virus);
    bacteria = Math.max(0, bacteria);

    graphData.push({
      day,
      virus: parseFloat(virus.toFixed(2)),
      bacteria: parseFloat(bacteria.toFixed(2)),
    });
  }

  return { graphData, finalVirus: virus, finalBacteria: bacteria };
}

function generatePrediction({ finalVirus, finalBacteria }) {
  const successRate = Math.max(0, 100 - (finalVirus + finalBacteria) / 2);
  const recoveryDays = Math.round((finalVirus + finalBacteria) / 4);

  let comment = '';
  if (successRate > 80) comment = 'Tedavi oldukça başarılı!';
  else if (successRate > 50) comment = 'Tedavi etkili ancak takip gerekebilir.';
  else comment = 'Tedavi yetersiz görünüyor, alternatif gerekebilir.';

  return {
    successRate: successRate.toFixed(1),
    recoveryDays,
    comment,
  };
}

export default function App() {
  const [virusType, setVirusType] = useState('FIP');
  const [days, setDays] = useState(30);
  const [catAge, setCatAge] = useState('adult');
  const [stress, setStress] = useState(40);
  const [nutrition, setNutrition] = useState(70);
  const [results, setResults] = useState(null);
  const [aiOutput, setAiOutput] = useState(null);

  const runSimulation = () => {
    const output = simulateTreatment({ virusType, stress, nutrition, catAge, days });
    setResults(output);
    setAiOutput(generatePrediction(output));
  };

  return (
    <div className="flex flex-col p-4 gap-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">Kedi Virüs & Bakteri Simülasyonu</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label>Virüs:</label>
          <select value={virusType} onChange={e => setVirusType(e.target.value)} className="w-full p-1 border rounded">
            <option value="FIP">FIP</option>
            <option value="FIV">FIV</option>
            <option value="FeLV">FeLV</option>
            <option value="FHV-1">FHV-1</option>
            <option value="FCV">FCV</option>
            <option value="FPV">FPV</option>
          </select>
        </div>

        <div>
          <label>Kedi Yaşı:</label>
          <select value={catAge} onChange={e => setCatAge(e.target.value)} className="w-full p-1 border rounded">
            <option value="kitten">Yavru</option>
            <option value="adult">Yetişkin</option>
            <option value="senior">Yaşlı</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label>Stres Seviyesi: {stress}</label>
          <input type="range" min={0} max={100} value={stress} onChange={e => setStress(Number(e.target.value))} className="w-full" />
        </div>

        <div>
          <label>Beslenme Durumu: {nutrition}</label>
          <input type="range" min={0} max={100} value={nutrition} onChange={e => setNutrition(Number(e.target.value))} className="w-full" />
        </div>
      </div>

      <div>
        <label>Simülasyon Süresi (gün):</label>
        <input type="number" min={1} max={100} value={days} onChange={e => setDays(Number(e.target.value))} className="w-full p-1 border rounded" />
      </div>

      <button onClick={runSimulation} className="bg-green-600 text-white p-2 rounded mt-4 w-full">Simülasyonu Başlat</button>

      <div className="h-[400px] w-full border rounded mt-6">
        <Canvas camera={{ position: [0, 1.5, 3] }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 2, 2]} />
          <CatModel virusType={virusType} />
          <OrbitControls />
        </Canvas>
      </div>

      {aiOutput && (
        <div className="mt-6 p-4 border rounded bg-gray-100">
          <h2 className="text-xl font-semibold">Yapay Zeka Önerisi</h2>
          <p>Tedavi Başarı Oranı: %{aiOutput.successRate}</p>
          <p>Tahmini İyileşme Süresi: {aiOutput.recoveryDays} gün</p>
          <p>Yorum: {aiOutput.comment}</p>
        </div>
      )}

      {results && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Simülasyon Grafiği</h2>
          <LineChart width={600} height={300} data={results.graphData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="virus" stroke="#8884d8" name="Virüs Yükü" />
            <Line type="monotone" dataKey="bacteria" stroke="#82ca9d" name="Bakteri Yükü" />
          </LineChart>
        </div>
      )}
    </div>
  );
}
