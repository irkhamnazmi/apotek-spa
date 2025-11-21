-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mariadb
-- Generation Time: Nov 21, 2025 at 11:40 PM
-- Server version: 10.6.24-MariaDB-ubu2204
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `palmirafit`
--

-- --------------------------------------------------------

--
-- Table structure for table `jenis_pembayaran`
--

CREATE TABLE `jenis_pembayaran` (
  `id_jenis_pembayaran` int(11) NOT NULL,
  `kode_jenis_pembayaran` char(10) DEFAULT NULL,
  `nama_jenis_pembayaran` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jenis_pembayaran`
--

INSERT INTO `jenis_pembayaran` (`id_jenis_pembayaran`, `kode_jenis_pembayaran`, `nama_jenis_pembayaran`) VALUES
(1, 'JP001', 'Tunai'),
(2, 'JP002', 'Debit'),
(3, 'JP003', 'E-Wallet');

-- --------------------------------------------------------

--
-- Table structure for table `kasir`
--

CREATE TABLE `kasir` (
  `id_kasir` int(11) NOT NULL,
  `no_struk` char(20) DEFAULT NULL,
  `id_kasir_detail` int(11) DEFAULT NULL,
  `waktu` timestamp NOT NULL DEFAULT current_timestamp(),
  `total` decimal(15,2) DEFAULT NULL,
  `jenis_pembayaran` int(11) DEFAULT NULL,
  `bayar` decimal(15,2) DEFAULT NULL,
  `kembali` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kasir`
--

INSERT INTO `kasir` (`id_kasir`, `no_struk`, `id_kasir_detail`, `waktu`, `total`, `jenis_pembayaran`, `bayar`, `kembali`, `created_at`) VALUES
(5, 'STRUK001', 1, '2025-11-16 00:12:38', 15000.00, 1, 20000.00, 5000.00, '2025-11-16 00:12:38'),
(6, 'STRUK002', 2, '2025-11-16 00:12:38', 15000.00, 2, 15000.00, 0.00, '2025-11-16 00:12:38'),
(7, 'STRUK003', 3, '2025-11-16 00:12:38', 16000.00, 3, 20000.00, 4000.00, '2025-11-16 00:12:38'),
(8, 'STRUK004', 4, '2025-11-16 00:12:38', 24000.00, 1, 25000.00, 1000.00, '2025-11-16 00:12:38');

-- --------------------------------------------------------

--
-- Table structure for table `kasir_detail`
--

CREATE TABLE `kasir_detail` (
  `id_kasir_detail` int(11) NOT NULL,
  `id_order` int(11) DEFAULT NULL,
  `subtotal` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kasir_detail`
--

INSERT INTO `kasir_detail` (`id_kasir_detail`, `id_order`, `subtotal`, `created_at`) VALUES
(1, 1, 15000, '2025-11-16 00:12:25'),
(2, 2, 15000, '2025-11-16 00:12:25'),
(3, 3, 16000, '2025-11-16 00:12:25'),
(4, 4, 24000, '2025-11-16 00:12:25');

-- --------------------------------------------------------

--
-- Table structure for table `lokasi_penyimpanan`
--

CREATE TABLE `lokasi_penyimpanan` (
  `id_lokasi_penyimpanan` int(11) NOT NULL,
  `kode_lokasi_penyimpanan` char(10) DEFAULT NULL,
  `lokasi_penyimpanan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lokasi_penyimpanan`
--

INSERT INTO `lokasi_penyimpanan` (`id_lokasi_penyimpanan`, `kode_lokasi_penyimpanan`, `lokasi_penyimpanan`) VALUES
(1, 'L001', 'Rak A1'),
(2, 'L002', 'Rak B1'),
(3, 'L003', 'Rak C1'),
(4, 'L004', 'Gudang Utama');

-- --------------------------------------------------------

--
-- Table structure for table `master_barang`
--

CREATE TABLE `master_barang` (
  `id_barang` int(11) NOT NULL,
  `kode_barang` char(10) NOT NULL,
  `nama_barang` text NOT NULL,
  `id_satuan` int(11) DEFAULT NULL,
  `harga_beli` decimal(15,2) DEFAULT NULL,
  `harga_jual` decimal(15,2) DEFAULT NULL,
  `stok_minimum` int(11) DEFAULT NULL,
  `stok_barang` int(11) DEFAULT NULL,
  `tgl_kadaluarsa` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `master_barang`
--

INSERT INTO `master_barang` (`id_barang`, `kode_barang`, `nama_barang`, `id_satuan`, `harga_beli`, `harga_jual`, `stok_minimum`, `stok_barang`, `tgl_kadaluarsa`, `created_at`, `updated_at`) VALUES
(5, 'OB001', 'Paracetamol 500mg', 3, 1000.00, 1500.00, 50, 200, '2025-12-31', '2025-11-16 00:06:11', '2025-11-16 00:06:11'),
(6, 'OB002', 'Amoxicillin 500mg', 3, 2000.00, 3000.00, 30, 100, '2024-10-31', '2025-11-16 00:06:11', '2025-11-16 00:06:11'),
(7, 'OB003', 'Vitamin C 1000mg', 1, 500.00, 800.00, 20, 150, '2026-03-31', '2025-11-16 00:06:11', '2025-11-16 00:06:11'),
(8, 'OB004', 'Cough Syrup 100ml', 2, 8000.00, 12000.00, 10, 50, '2025-06-30', '2025-11-16 00:06:11', '2025-11-16 00:06:11'),
(10, 'OB005', 'Komix', 1, 2000.00, 3000.00, 10, 100, '2025-11-29', '2025-11-19 08:00:44', '2025-11-19 08:00:44');

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `id_order` int(11) NOT NULL,
  `id_barang` int(11) DEFAULT NULL,
  `qty` int(11) DEFAULT NULL,
  `jumlah_harga` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order`
--

INSERT INTO `order` (`id_order`, `id_barang`, `qty`, `jumlah_harga`, `created_at`) VALUES
(1, 5, 10, 15000.00, '2025-11-16 00:11:07'),
(2, 6, 5, 15000.00, '2025-11-16 00:11:07'),
(3, 7, 20, 16000.00, '2025-11-16 00:11:07'),
(4, 8, 2, 24000.00, '2025-11-16 00:11:07');

-- --------------------------------------------------------

--
-- Table structure for table `satuan`
--

CREATE TABLE `satuan` (
  `id_satuan` int(11) NOT NULL,
  `kode_satuan` char(10) NOT NULL,
  `nama_satuan` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `satuan`
--

INSERT INTO `satuan` (`id_satuan`, `kode_satuan`, `nama_satuan`) VALUES
(1, 'S001', 'Pcs'),
(2, 'S002', 'Botol'),
(3, 'S003', 'Strip'),
(4, 'S004', 'Box');

-- --------------------------------------------------------

--
-- Table structure for table `stok_opname`
--

CREATE TABLE `stok_opname` (
  `id_stok_opname` int(11) NOT NULL,
  `id_barang` int(11) DEFAULT NULL,
  `id_lokasi_penyimpanan` int(11) DEFAULT NULL,
  `stok_rak` int(11) DEFAULT NULL,
  `kapasitas_rak` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stok_opname`
--

INSERT INTO `stok_opname` (`id_stok_opname`, `id_barang`, `id_lokasi_penyimpanan`, `stok_rak`, `kapasitas_rak`, `created_at`, `updated_at`) VALUES
(9, 5, 1, 50, 100, '2025-11-16 00:10:37', '2025-11-16 00:10:37'),
(10, 6, 2, 30, 50, '2025-11-16 00:10:37', '2025-11-16 00:10:37'),
(11, 7, 3, 100, 200, '2025-11-16 00:10:37', '2025-11-16 00:10:37'),
(12, 8, 1, 20, 50, '2025-11-16 00:10:37', '2025-11-16 00:10:37');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `nik` char(20) NOT NULL,
  `nama_lengkap` text NOT NULL,
  `username` text NOT NULL,
  `password` text NOT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `email` text DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `role` char(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `nik`, `nama_lengkap`, `username`, `password`, `no_hp`, `email`, `alamat`, `role`, `created_at`, `updated_at`) VALUES
(4, '25111', 'Admin', 'admin', 'admin', '', 'admin@gmail.com', 'Purwodadi ', 'admin', '2025-11-21 06:44:27', '2025-11-21 23:34:28');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `jenis_pembayaran`
--
ALTER TABLE `jenis_pembayaran`
  ADD PRIMARY KEY (`id_jenis_pembayaran`);

--
-- Indexes for table `kasir`
--
ALTER TABLE `kasir`
  ADD PRIMARY KEY (`id_kasir`),
  ADD KEY `id_kasir_detail` (`id_kasir_detail`),
  ADD KEY `jenis_pembayaran` (`jenis_pembayaran`);

--
-- Indexes for table `kasir_detail`
--
ALTER TABLE `kasir_detail`
  ADD PRIMARY KEY (`id_kasir_detail`),
  ADD KEY `id_order` (`id_order`);

--
-- Indexes for table `lokasi_penyimpanan`
--
ALTER TABLE `lokasi_penyimpanan`
  ADD PRIMARY KEY (`id_lokasi_penyimpanan`);

--
-- Indexes for table `master_barang`
--
ALTER TABLE `master_barang`
  ADD PRIMARY KEY (`id_barang`),
  ADD KEY `id_satuan` (`id_satuan`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id_order`),
  ADD KEY `id_barang` (`id_barang`);

--
-- Indexes for table `satuan`
--
ALTER TABLE `satuan`
  ADD PRIMARY KEY (`id_satuan`);

--
-- Indexes for table `stok_opname`
--
ALTER TABLE `stok_opname`
  ADD PRIMARY KEY (`id_stok_opname`),
  ADD KEY `id_barang` (`id_barang`),
  ADD KEY `id_lokasi_penyimpanan` (`id_lokasi_penyimpanan`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `jenis_pembayaran`
--
ALTER TABLE `jenis_pembayaran`
  MODIFY `id_jenis_pembayaran` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `kasir`
--
ALTER TABLE `kasir`
  MODIFY `id_kasir` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `kasir_detail`
--
ALTER TABLE `kasir_detail`
  MODIFY `id_kasir_detail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `lokasi_penyimpanan`
--
ALTER TABLE `lokasi_penyimpanan`
  MODIFY `id_lokasi_penyimpanan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `master_barang`
--
ALTER TABLE `master_barang`
  MODIFY `id_barang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `order`
--
ALTER TABLE `order`
  MODIFY `id_order` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `satuan`
--
ALTER TABLE `satuan`
  MODIFY `id_satuan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `stok_opname`
--
ALTER TABLE `stok_opname`
  MODIFY `id_stok_opname` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `kasir`
--
ALTER TABLE `kasir`
  ADD CONSTRAINT `kasir_ibfk_1` FOREIGN KEY (`id_kasir_detail`) REFERENCES `kasir_detail` (`id_kasir_detail`),
  ADD CONSTRAINT `kasir_ibfk_2` FOREIGN KEY (`jenis_pembayaran`) REFERENCES `jenis_pembayaran` (`id_jenis_pembayaran`);

--
-- Constraints for table `kasir_detail`
--
ALTER TABLE `kasir_detail`
  ADD CONSTRAINT `kasir_detail_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `order` (`id_order`);

--
-- Constraints for table `master_barang`
--
ALTER TABLE `master_barang`
  ADD CONSTRAINT `master_barang_ibfk_1` FOREIGN KEY (`id_satuan`) REFERENCES `satuan` (`id_satuan`);

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `order_ibfk_1` FOREIGN KEY (`id_barang`) REFERENCES `master_barang` (`id_barang`);

--
-- Constraints for table `stok_opname`
--
ALTER TABLE `stok_opname`
  ADD CONSTRAINT `stok_opname_ibfk_1` FOREIGN KEY (`id_barang`) REFERENCES `master_barang` (`id_barang`),
  ADD CONSTRAINT `stok_opname_ibfk_2` FOREIGN KEY (`id_lokasi_penyimpanan`) REFERENCES `lokasi_penyimpanan` (`id_lokasi_penyimpanan`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
