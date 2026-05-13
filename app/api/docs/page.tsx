"use client";

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  return (
    <div className="bg-white min-h-screen">
      <SwaggerUI url="/api/docs/spec" />
    </div>
  );
}
