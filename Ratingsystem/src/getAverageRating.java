public double getAverageRating(int tipId) {
    String sql = "SELECT AVG(rating_value) AS averageRating FROM TipRatings WHERE TipID = ?";

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
        stmt.setInt(1, tipId);

        ResultSet rs = stmt.executeQuery();

        if (rs.next()) {
            return rs.getDouble("averageRating");
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return 0.0;
}
