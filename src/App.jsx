import React, { useState, useEffect } from 'react';
import { Stage, Layer, Image, Circle } from 'react-konva';
import useImage from 'use-image';
import * as XLSX from 'xlsx';

const URL_DENAH = '/denah-kantor-sewa-sederhana.png';

const warnaDasar = ['blue', 'orange', 'green', 'purple', 'red', 'brown', 'cyan', 'pink', 'yellow', 'teal'];

const warnaPerangkat = {};

const getWarnaPerangkat = (jenis) => {
  if (!warnaPerangkat[jenis]) {
    const warnaTersedia = warnaDasar[Object.keys(warnaPerangkat).length % warnaDasar.length];
    warnaPerangkat[jenis] = warnaTersedia;
  }
  return warnaPerangkat[jenis];
};

const DenahImage = () => {
  const [image] = useImage(URL_DENAH);
  return <Image image={image} width={800} height={600} />;
};

const App = () => {
  const [devices, setDevices] = useState([]);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    fetch('/Data Barang.xlsx')
      .then(res => res.arrayBuffer())
      .then(data => {
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const devicesWithPosition = json.map((item, idx) => ({
          id: item['ID Perangkat'],
          tanggal: item['Tanggal pembelian'],
          harga: item['Harga'],
          jenis: item['Jenis'],
          x: 50 + idx * 50,
          y: 50 + idx * 50,
        }));
        setDevices(devicesWithPosition);
      });
  }, []);

  const handleDragEnd = (e, id) => {
    setDevices(devices.map(device => device.id === id
      ? { ...device, x: e.target.x(), y: e.target.y() }
      : device));
  };

  const [hoverInfo, setHoverInfo] = useState(null);

  const handleMouseEnter = (e, device) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    setHoverInfo({ 
      device, 
      position: { x: pointerPosition.x + 10, y: pointerPosition.y + 10 }
    });
  };

  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Mapping Perangkat Kantor</h2>
      
      <button 
        onClick={() => setIsEditable(!isEditable)}
        style={{
          padding: '8px 16px',
          marginBottom: '10px',
          cursor: 'pointer',
          background: isEditable ? '#28a745' : '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        {isEditable ? "Selesai Edit" : "Edit Posisi Icon"}
      </button>

      <div style={{ position: 'relative', width: 800, height: 600 }}>
        <Stage width={800} height={600}>
          <Layer>
            <DenahImage />
            {devices.map(device => (
              <Circle
                key={device.id}
                x={device.x}
                y={device.y}
                radius={12}
                fill={getWarnaPerangkat(device.jenis)}
                draggable={isEditable}
                onDragEnd={(e) => handleDragEnd(e, device.id)}
                onMouseEnter={(e) => handleMouseEnter(e, device)}
                onMouseLeave={handleMouseLeave}
                onClick={() => alert(`ID: ${device.id}\nTanggal: ${device.tanggal}\nHarga: ${device.harga}\nJenis: ${device.jenis}`)}
              />
            ))}
          </Layer>
        </Stage>

        {hoverInfo && (
          <div style={{
            position: 'absolute',
            top: hoverInfo.position.y,
            left: hoverInfo.position.x,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 10,
            fontSize: '12px'
          }}>
            <div><strong>ID:</strong> {hoverInfo.device.id}</div>
            <div><strong>Tanggal:</strong> {hoverInfo.device.tanggal}</div>
            <div><strong>Harga:</strong> Rp {hoverInfo.device.harga}</div>
            <div><strong>Jenis:</strong> {hoverInfo.device.jenis}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
