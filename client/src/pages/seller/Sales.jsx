import React from 'react';
import ProductQuickSearch from '../../components/ProductQuickSearch';
import SellerSaleForm from '../../components/SellerSaleForm';

export default function Sales() {
  const saleFormRef = React.useRef();
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  return (
    <div>
      <ProductQuickSearch onSelect={(p)=> { setSelectedProduct(p); saleFormRef.current && saleFormRef.current.addLine && saleFormRef.current.addLine(p); }} />
      <SellerSaleForm ref={saleFormRef} onSaved={()=>{ /* reload etc */ }} />
    </div>
  );
}