import React from 'react';

export default function EnhancedGridLayout() {
  const gridSize = 75; // Adjust this to change grid density
  const rows = Array.from({ length: gridSize }, (_, i) => i);
  const cols = Array.from({ length: gridSize }, (_, i) => i);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <div className="relative w-full h-full">
        {/* Grid with depth field effect */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-[#e0faff] via-[#c6f7ff] to-[#7DF9FF] opacity-30"></div> */}
        {/* {rows.map((_, i) => {
          const depthFactor = Math.abs(i - (gridSize - 1) / 2) / (gridSize / 2);
          const opacity = 0.4 - depthFactor * 0.7;
          return (
            <div
              key={`h-${i}`}
              className="absolute left-0 w-full"
              style={{
                top: `${(i / (gridSize - 1)) * 100}%`,
                height: '2px',
                background: `linear-gradient(90deg, 
                  rgba(125, 249, 255, ${opacity * 0.3}) 0%, 
                  rgba(125, 249, 255, ${opacity}) 50%, 
                  rgba(125, 249, 255, ${opacity * 0.3}) 100%)`,
                boxShadow: `0 1px 2px rgba(125, 249, 255, ${0.1 * opacity})`,
              }}
            />
          );
        })} */}
        
        {/* Vertical grid lines with depth */}
        {/* {cols.map((_, i) => {
          const depthFactor = Math.abs(i - (gridSize - 1) / 2) / (gridSize / 2);
          const opacity = 0.4 - depthFactor * 0.7;
          return (
            <div
              key={`v-${i}`}
              className="absolute top-0 h-full"
              style={{
                left: `${(i / (gridSize - 1)) * 100}%`,
                width: '2px',
                background: `linear-gradient(180deg, 
                  rgba(125, 249, 255, ${opacity * 0.3}) 0%, 
                  rgba(125, 249, 255, ${opacity}) 20%, 
                  rgba(125, 249, 255, ${opacity * 0.3}) 100%)`,
                boxShadow: `1px 0 2px rgba(125, 249, 255, ${0.1 * opacity})`,
              }}
            />
          );
        })}
         */}
        {/* Enhanced intersection areas */}
        {rows.map((_, rowIdx) =>
          cols.map((_, colIdx) => {
            const rowDepth = Math.abs(rowIdx - (gridSize - 1) / 2) / (gridSize / 2);
            const colDepth = Math.abs(colIdx - (gridSize - 1) / 2) / (gridSize / 2);
            const avgDepth = (rowDepth + colDepth) / 2;
            const intensity = 0.9 - avgDepth * 0.2;
            
            return (
              <div
                key={`intersection-${rowIdx}-${colIdx}`}
                className="absolute"
                style={{
                  width: 10,
                  height: 10,
                  left: `calc(${(colIdx / (gridSize - 1)) * 100}% - 3px)`,
                  top: `calc(${(rowIdx / (gridSize - 1)) * 100}% - 3px)`,
                  background: `radial-gradient(circle, rgba(125, 249, 255, ${intensity}) 0%, rgba(125, 249, 255, ${intensity * 0.3}) 100%)`,
                  zIndex: 15,
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}