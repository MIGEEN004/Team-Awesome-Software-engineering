
public int getUserPoints(int userId) {
        String sql = "SELECT points FROM Users WHERE UserID = ?";

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
        stmt.setInt(1, userId);

        ResultSet rs = stmt.executeQuery();

        if (rs.next()) {
            return rs.getInt("points");
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return 0;
}

